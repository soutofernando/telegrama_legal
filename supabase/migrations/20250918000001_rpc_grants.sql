REVOKE ALL ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION place_order(TEXT, UUID, payment_method, UUID, JSONB) TO service_role;

REVOKE ALL ON FUNCTION mark_delivery_group_delivered(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_delivery_group_delivered(UUID, UUID) TO service_role;

ALTER VIEW public_products SET (security_invoker = true);
