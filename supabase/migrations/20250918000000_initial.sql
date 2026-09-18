-- Telegrama Legal — schema inicial

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE payment_method AS ENUM ('whatsapp', 'on_delivery');
CREATE TYPE delivery_status AS ENUM ('pending', 'delivered');

-- Equipes
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Horários de entrega
CREATE TABLE delivery_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horario TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL DEFAULT '',
  preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
  imagem_url TEXT NOT NULL,
  estoque INT NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pedidos (compra)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_comprador TEXT NOT NULL,
  equipe_id UUID NOT NULL REFERENCES teams (id),
  forma_pagamento payment_method NOT NULL,
  delivery_slot_id UUID NOT NULL REFERENCES delivery_slots (id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Itens de entrega (prendas)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products (id),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  nome_recebedor TEXT NOT NULL,
  equipe_destino_id UUID NOT NULL REFERENCES teams (id),
  delivery_slot_id UUID NOT NULL REFERENCES delivery_slots (id),
  status delivery_status NOT NULL DEFAULT 'pending',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_delivery ON order_items (status, equipe_destino_id, delivery_slot_id, criado_em);
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- View pública (sem estoque exato)
CREATE VIEW public_products AS
SELECT
  id,
  nome,
  descricao,
  preco,
  imagem_url,
  (estoque > 0) AS disponivel
FROM products;

-- Limite de compra sem expor estoque (cap em 20 para UX)
CREATE OR REPLACE FUNCTION get_product_max_quantity(p_product_id UUID)
RETURNS INT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT LEAST(estoque, 20)::INT
  FROM products
  WHERE id = p_product_id;
$$;

GRANT SELECT ON public_products TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_product_max_quantity(UUID) TO anon, authenticated;

-- Pedido atômico com débito de estoque
CREATE OR REPLACE FUNCTION place_order(
  p_nome_comprador TEXT,
  p_equipe_id UUID,
  p_forma_pagamento payment_method,
  p_delivery_slot_id UUID,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_qty INT;
  v_updated INT;
BEGIN
  IF p_nome_comprador IS NULL OR trim(p_nome_comprador) = '' THEN
    RAISE EXCEPTION 'Nome do comprador é obrigatório';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Carrinho vazio';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_equipe_id) THEN
    RAISE EXCEPTION 'Equipe inválida';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM delivery_slots WHERE id = p_delivery_slot_id) THEN
    RAISE EXCEPTION 'Horário de entrega inválido';
  END IF;

  INSERT INTO orders (nome_comprador, equipe_id, forma_pagamento, delivery_slot_id)
  VALUES (trim(p_nome_comprador), p_equipe_id, p_forma_pagamento, p_delivery_slot_id)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantidade')::INT;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    UPDATE products
    SET estoque = estoque - v_qty,
        updated_at = now()
    WHERE id = v_product_id
      AND estoque >= v_qty;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
      RAISE EXCEPTION 'Estoque insuficiente para o produto solicitado';
    END IF;

    INSERT INTO order_items (
      order_id,
      product_id,
      quantidade,
      nome_recebedor,
      equipe_destino_id,
      delivery_slot_id
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_qty,
      trim(p_nome_comprador),
      p_equipe_id,
      p_delivery_slot_id
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

-- Marcar grupo como entregue
CREATE OR REPLACE FUNCTION mark_delivery_group_delivered(
  p_equipe_id UUID,
  p_delivery_slot_id UUID
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE order_items
  SET status = 'delivered'
  WHERE equipe_destino_id = p_equipe_id
    AND delivery_slot_id = p_delivery_slot_id
    AND status = 'pending';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB) TO service_role;

REVOKE ALL ON FUNCTION mark_delivery_group_delivered(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION mark_delivery_group_delivered(UUID, UUID) TO service_role;

-- RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Leitura pública: equipes e horários (checkout)
CREATE POLICY "teams_public_read" ON teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "delivery_slots_public_read" ON delivery_slots FOR SELECT TO anon, authenticated USING (true);

-- Produtos: leitura pública (admin usa service role ou authenticated)
CREATE POLICY "products_public_read" ON products FOR SELECT TO anon, authenticated USING (true);

-- Pedidos/itens: apenas authenticated (admin)
CREATE POLICY "orders_admin_all" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "order_items_admin_all" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "teams_admin_write" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delivery_slots_admin_write" ON delivery_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "products_admin_write" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "products_admin_update" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "products_admin_delete" ON products FOR DELETE TO authenticated USING (true);

-- Storage bucket (rodar no dashboard ou via SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "products_images_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

CREATE POLICY "products_images_admin_upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

CREATE POLICY "products_images_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

CREATE POLICY "products_images_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
