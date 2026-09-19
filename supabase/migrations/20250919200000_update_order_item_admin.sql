CREATE OR REPLACE FUNCTION update_order_item_admin(
  p_item_id UUID,
  p_nome_recebedor TEXT,
  p_equipe_destino_id UUID,
  p_delivery_slot_id UUID,
  p_product_id UUID,
  p_quantidade INT,
  p_nome_comprador TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old RECORD;
  v_product_tipo product_kind;
  v_preco NUMERIC;
  v_preco_promo NUMERIC;
  v_combo_qty INT;
  v_combo_preco NUMERIC;
  v_valor_linha NUMERIC;
  v_updated INT;
  v_buyer TEXT;
BEGIN
  IF p_item_id IS NULL THEN
    RAISE EXCEPTION 'Item inválido';
  END IF;

  IF p_nome_recebedor IS NULL OR trim(p_nome_recebedor) = '' THEN
    RAISE EXCEPTION 'Informe quem recebe';
  END IF;

  IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade inválida';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM teams WHERE id = p_equipe_destino_id) THEN
    RAISE EXCEPTION 'Equipe inválida';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM delivery_slots WHERE id = p_delivery_slot_id) THEN
    RAISE EXCEPTION 'Horário inválido';
  END IF;

  SELECT
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.quantidade,
    oi.serenata_song_id,
    p.tipo AS product_tipo
  INTO v_old
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  WHERE oi.id = p_item_id;

  IF v_old.id IS NULL THEN
    RAISE EXCEPTION 'Item não encontrado';
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
  WHERE id = p_product_id;

  IF v_product_tipo IS NULL THEN
    RAISE EXCEPTION 'Produto inválido';
  END IF;

  IF v_old.product_tipo = 'serenata' AND p_product_id <> v_old.product_id THEN
    RAISE EXCEPTION 'Não é possível trocar o produto de uma serenata';
  END IF;

  IF p_product_id <> v_old.product_id OR p_quantidade <> v_old.quantidade THEN
    UPDATE products
    SET estoque = estoque + v_old.quantidade,
        updated_at = now()
    WHERE id = v_old.product_id;

    UPDATE products
    SET estoque = estoque - p_quantidade,
        updated_at = now()
    WHERE id = p_product_id
      AND estoque >= p_quantidade;

    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
      UPDATE products
      SET estoque = estoque - v_old.quantidade,
          updated_at = now()
      WHERE id = v_old.product_id;
      RAISE EXCEPTION 'Estoque insuficiente para o produto solicitado';
    END IF;
  END IF;

  IF v_combo_qty IS NOT NULL AND v_combo_qty > 1 AND v_combo_preco IS NOT NULL THEN
    v_valor_linha := product_line_total(
      p_quantidade,
      v_preco,
      v_preco_promo,
      NULL,
      NULL
    );
  ELSE
    v_valor_linha := product_line_total(
      p_quantidade,
      v_preco,
      v_preco_promo,
      v_combo_qty,
      v_combo_preco
    );
  END IF;

  UPDATE order_items
  SET
    nome_recebedor = trim(p_nome_recebedor),
    equipe_destino_id = p_equipe_destino_id,
    delivery_slot_id = p_delivery_slot_id,
    product_id = p_product_id,
    quantidade = p_quantidade,
    valor_linha = v_valor_linha,
    serenata_song_id = CASE
      WHEN v_product_tipo = 'serenata' THEN serenata_song_id
      ELSE NULL
    END
  WHERE id = p_item_id;

  PERFORM redistribute_order_combo_totals(v_old.order_id);

  v_buyer := NULLIF(trim(p_nome_comprador), '');
  IF v_buyer IS NOT NULL THEN
    UPDATE orders
    SET nome_comprador = v_buyer
    WHERE id = v_old.order_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION update_order_item_admin(UUID, TEXT, UUID, UUID, UUID, INT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_order_item_admin(UUID, TEXT, UUID, UUID, UUID, INT, TEXT) TO service_role;
