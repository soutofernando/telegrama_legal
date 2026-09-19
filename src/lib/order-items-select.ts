/** Shared Supabase select for admin order item lists. */
export const ORDER_ITEMS_ADMIN_SELECT =
  "*, teams!order_items_equipe_destino_id_fkey(nome), delivery_slots(horario, sort_order), products(nome, tipo), orders(nome_comprador, forma_pagamento), serenata_songs(titulo)";
