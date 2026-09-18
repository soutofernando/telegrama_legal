-- Tipos de produto, músicas de serenata e pedidos

CREATE TYPE product_kind AS ENUM (
  'botton',
  'serenata',
  'prenda',
  'adesivo',
  'tirante'
);

ALTER TABLE products
  ADD COLUMN tipo product_kind NOT NULL DEFAULT 'botton';

UPDATE products
SET
  tipo = 'botton',
  nome = trim(regexp_replace(nome, '^Botton\s+', '', 'i'))
WHERE nome ~* '^Botton\s+';

CREATE TABLE serenata_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE order_items
  ADD COLUMN serenata_song_id UUID REFERENCES serenata_songs (id);

DROP VIEW IF EXISTS public_products;

CREATE VIEW public_products AS
SELECT
  id,
  nome,
  descricao,
  preco,
  imagem_url,
  tipo,
  (estoque > 0) AS disponivel
FROM products;

GRANT SELECT ON public_products TO anon, authenticated;

ALTER TABLE serenata_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "serenata_songs_public_read"
  ON serenata_songs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "serenata_songs_admin_write"
  ON serenata_songs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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
  v_serenata_song_id UUID;
  v_product_tipo product_kind;
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
    v_serenata_song_id := NULLIF(trim(v_item->>'serenata_song_id'), '')::UUID;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    SELECT tipo INTO v_product_tipo FROM products WHERE id = v_product_id;

    IF v_product_tipo IS NULL THEN
      RAISE EXCEPTION 'Produto inválido';
    END IF;

    IF v_product_tipo = 'serenata' THEN
      IF v_serenata_song_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM serenata_songs WHERE id = v_serenata_song_id
      ) THEN
        RAISE EXCEPTION 'Música da serenata é obrigatória';
      END IF;
    ELSE
      v_serenata_song_id := NULL;
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
      delivery_slot_id,
      serenata_song_id
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_qty,
      trim(p_nome_comprador),
      p_equipe_id,
      p_delivery_slot_id,
      v_serenata_song_id
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB) TO service_role;
