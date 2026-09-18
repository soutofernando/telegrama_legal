-- Entrega na equipe vs retirada no balcão

CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfillment_type fulfillment_type NOT NULL DEFAULT 'delivery';

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS fulfillment_type fulfillment_type NOT NULL DEFAULT 'delivery';

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

    v_valor_linha := product_line_total(
      v_qty,
      v_preco,
      v_preco_promo,
      v_combo_qty,
      v_combo_preco
    );

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
      fulfillment_type
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
      p_fulfillment_type
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

DROP FUNCTION IF EXISTS place_order(TEXT, UUID, payment_method, UUID, JSONB);

REVOKE ALL ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB, fulfillment_type) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB, fulfillment_type) TO service_role;
