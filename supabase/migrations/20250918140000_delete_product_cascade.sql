-- Exclusão atômica de produto + itens de pedido + pedidos vazios
CREATE OR REPLACE FUNCTION delete_product_cascade(p_product_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  DELETE FROM order_items WHERE product_id = p_product_id;

  DELETE FROM orders o
  WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi WHERE oi.order_id = o.id
  );

  DELETE FROM products WHERE id = p_product_id;
END;
$$;

REVOKE ALL ON FUNCTION delete_product_cascade(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_product_cascade(UUID) TO service_role;
