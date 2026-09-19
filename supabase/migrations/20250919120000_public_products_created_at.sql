-- Expõe created_at na view pública para ordenação por cadastro (sem estoque).

DROP VIEW IF EXISTS public_products;

CREATE VIEW public_products AS
SELECT
  id,
  nome,
  descricao,
  preco,
  preco_promocional,
  promo_combo_quantidade,
  promo_combo_preco,
  imagem_url,
  tipo,
  (estoque > 0) AS disponivel,
  created_at
FROM products;

GRANT SELECT ON public_products TO anon, authenticated;
