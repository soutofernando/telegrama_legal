CREATE OR REPLACE FUNCTION set_order_items_status(
  p_ids UUID[],
  p_status delivery_status
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE order_items
  SET status = p_status
  WHERE id = ANY (p_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION set_order_items_status(UUID[], delivery_status) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION set_order_items_status(UUID[], delivery_status) TO service_role;
