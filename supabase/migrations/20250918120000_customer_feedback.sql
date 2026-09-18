-- Central de reclamações e feedbacks

CREATE TYPE feedback_type AS ENUM ('feedback', 'complaint', 'suggestion');
CREATE TYPE feedback_status AS ENUM ('new', 'in_progress', 'resolved');

CREATE TABLE customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo feedback_type NOT NULL,
  nome TEXT NOT NULL,
  equipe_id UUID REFERENCES teams (id) ON DELETE SET NULL,
  contato TEXT,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  avaliacao SMALLINT CHECK (avaliacao IS NULL OR (avaliacao >= 1 AND avaliacao <= 5)),
  status feedback_status NOT NULL DEFAULT 'new',
  nota_admin TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_feedback_status ON customer_feedback (status, criado_em DESC);

ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_feedback_anon_insert"
ON customer_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  trim(nome) <> ''
  AND trim(assunto) <> ''
  AND trim(mensagem) <> ''
);

CREATE POLICY "customer_feedback_admin_all"
ON customer_feedback
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
