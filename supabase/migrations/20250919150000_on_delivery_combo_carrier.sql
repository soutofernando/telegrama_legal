-- Pay on delivery → delivered; combo promo pooled by product kind; carrier name on route.

UPDATE order_items oi
SET status = 'delivered'
FROM orders o
WHERE oi.order_id = o.id
  AND o.forma_pagamento = 'on_delivery'
  AND oi.status IN ('pending', 'in_progress');

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS entregador_nome TEXT;

CREATE OR REPLACE FUNCTION redistribute_order_combo_totals(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  r_pool RECORD;
  v_pool_total NUMERIC;
  v_allocated NUMERIC;
  v_line_amount NUMERIC;
  v_i INT;
  v_line_count INT;
BEGIN
  FOR r_pool IN
    SELECT
      p.tipo,
      p.promo_combo_quantidade AS combo_qty,
      p.promo_combo_preco AS combo_preco,
      MIN(p.preco) AS preco,
      MIN(p.preco_promocional) AS preco_promo,
      SUM(oi.quantidade)::INT AS total_qty,
      array_agg(oi.id ORDER BY oi.criado_em, oi.id) AS line_ids,
      array_agg(oi.quantidade ORDER BY oi.criado_em, oi.id) AS line_qtys
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
      AND p.promo_combo_quantidade IS NOT NULL
      AND p.promo_combo_quantidade > 1
      AND p.promo_combo_preco IS NOT NULL
    GROUP BY p.tipo, p.promo_combo_quantidade, p.promo_combo_preco
    HAVING SUM(oi.quantidade) > 0
  LOOP
    v_pool_total := product_line_total(
      r_pool.total_qty,
      r_pool.preco,
      r_pool.preco_promo,
      r_pool.combo_qty,
      r_pool.combo_preco
    );

    v_line_count := array_length(r_pool.line_ids, 1);
    v_allocated := 0;

    FOR v_i IN 1..v_line_count - 1 LOOP
      v_line_amount := round(
        v_pool_total * r_pool.line_qtys[v_i]::NUMERIC / r_pool.total_qty,
        2
      );
      UPDATE order_items
      SET valor_linha = v_line_amount
      WHERE id = r_pool.line_ids[v_i];
      v_allocated := v_allocated + v_line_amount;
    END LOOP;

    UPDATE order_items
    SET valor_linha = round(v_pool_total - v_allocated, 2)
    WHERE id = r_pool.line_ids[v_line_count];
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION place_order(
  p_nome_comprador TEXT,
  p_equipe_id UUID,
  p_forma_pagamento payment_method,
  p_delivery_slot_id UUID,
  p_items JSONB,
  p_fulfillment_type fulfillment_type DEFAULT 'delivery'
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
  v_preco NUMERIC;
  v_preco_promo NUMERIC;
  v_combo_qty INT;
  v_combo_preco NUMERIC;
  v_valor_linha NUMERIC;
  v_nome_recebedor TEXT;
  v_equipe_destino_id UUID;
  v_eh_presente BOOLEAN;
  v_item_status delivery_status;
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
    RAISE EXCEPTION 'Horário inválido';
  END IF;

  IF p_fulfillment_type IS NULL THEN
    p_fulfillment_type := 'delivery';
  END IF;

  v_item_status := CASE
    WHEN p_forma_pagamento = 'on_delivery' THEN 'delivered'::delivery_status
    ELSE 'pending'::delivery_status
  END;

  INSERT INTO orders (
    nome_comprador,
    equipe_id,
    forma_pagamento,
    delivery_slot_id,
    fulfillment_type
  )
  VALUES (
    trim(p_nome_comprador),
    p_equipe_id,
    p_forma_pagamento,
    p_delivery_slot_id,
    p_fulfillment_type
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_qty := (v_item->>'quantidade')::INT;
    v_serenata_song_id := NULLIF(trim(v_item->>'serenata_song_id'), '')::UUID;
    v_nome_recebedor := NULLIF(trim(v_item->>'nome_recebedor'), '');
    v_equipe_destino_id := NULLIF(trim(v_item->>'equipe_destino_id'), '')::UUID;
    v_eh_presente := COALESCE((v_item->>'eh_presente')::BOOLEAN, false);

    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    SELECT
      tipo,
      preco,
      preco_promocional,
      promo_combo_quantidade,
      promo_combo_preco
    INTO
      v_product_tipo,
      v_preco,
      v_preco_promo,
      v_combo_qty,
      v_combo_preco
    FROM products
    WHERE id = v_product_id;

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

    IF v_eh_presente THEN
      IF v_nome_recebedor IS NULL THEN
        RAISE EXCEPTION 'Informe para quem vai o presente';
      END IF;
      IF v_equipe_destino_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM teams WHERE id = v_equipe_destino_id
      ) THEN
        RAISE EXCEPTION 'Equipe de destino inválida';
      END IF;
    ELSE
      v_nome_recebedor := trim(p_nome_comprador);
      v_equipe_destino_id := p_equipe_id;
      v_eh_presente := false;
    END IF;

    IF v_combo_qty IS NOT NULL AND v_combo_qty > 1 AND v_combo_preco IS NOT NULL THEN
      v_valor_linha := product_line_total(
        v_qty,
        v_preco,
        v_preco_promo,
        NULL,
        NULL
      );
    ELSE
      v_valor_linha := product_line_total(
        v_qty,
        v_preco,
        v_preco_promo,
        v_combo_qty,
        v_combo_preco
      );
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
      serenata_song_id,
      valor_linha,
      eh_presente,
      fulfillment_type,
      status
    )
    VALUES (
      v_order_id,
      v_product_id,
      v_qty,
      v_nome_recebedor,
      v_equipe_destino_id,
      p_delivery_slot_id,
      v_serenata_song_id,
      v_valor_linha,
      v_eh_presente,
      p_fulfillment_type,
      v_item_status
    );
  END LOOP;

  PERFORM redistribute_order_combo_totals(v_order_id);

  RETURN v_order_id;
END;
$$;

DROP FUNCTION IF EXISTS set_order_items_status(UUID[], delivery_status);

CREATE OR REPLACE FUNCTION set_order_items_status(
  p_ids UUID[],
  p_status delivery_status,
  p_entregador_nome TEXT DEFAULT NULL
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
  v_carrier TEXT;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  v_carrier := NULLIF(trim(p_entregador_nome), '');

  UPDATE order_items
  SET
    status = p_status,
    entregador_nome = CASE
      WHEN p_status = 'in_progress' AND v_carrier IS NOT NULL THEN v_carrier
      ELSE entregador_nome
    END
  WHERE id = ANY (p_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB, fulfillment_type) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB, fulfillment_type) TO service_role;

REVOKE ALL ON FUNCTION set_order_items_status(UUID[], delivery_status, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION set_order_items_status(UUID[], delivery_status, TEXT) TO service_role;

REVOKE ALL ON FUNCTION redistribute_order_combo_totals(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION redistribute_order_combo_totals(UUID) TO service_role;
