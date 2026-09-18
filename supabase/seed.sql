-- Dados iniciais de exemplo (ajuste antes do evento)

INSERT INTO teams (nome) VALUES
  ('Cozinha'),
  ('Decoração'),
  ('Liturgia'),
  ('Recepção')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO delivery_slots (horario, sort_order) VALUES
  ('13h', 1),
  ('14h', 2),
  ('15h', 3),
  ('16h', 4),
  ('17h', 5);

-- Produtos de exemplo (substitua imagem_url por upload real no admin)
INSERT INTO products (nome, descricao, preco, imagem_url, estoque) VALUES
  (
    'Serenata',
    'Mensagem cantada para alguém especial do encontro.',
    25.00,
    'https://placehold.co/600x400/f5f5f4/171717?text=Serenata',
    50
  ),
  (
    'Adesivo ECRI',
    'Adesivo oficial do encontro.',
    5.00,
    'https://placehold.co/600x400/f5f5f4/171717?text=Adesivo',
    200
  ),
  (
    'Botton',
    'Botton colecionável.',
    8.00,
    'https://placehold.co/600x400/f5f5f4/171717?text=Botton',
    150
  );
