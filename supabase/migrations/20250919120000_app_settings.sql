CREATE TABLE app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  whatsapp_number TEXT NOT NULL DEFAULT '',
  whatsapp_message_template TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO app_settings (id, whatsapp_number, whatsapp_message_template)
VALUES (
  'default',
  '',
  'Olá! Sou {{nome}}. Acabei de fazer um pedido no Telegrama Legal:

{{itens}}

Total: {{total}}

Envio o comprovante em anexo.'
)
ON CONFLICT (id) DO NOTHING;
