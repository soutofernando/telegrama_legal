"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveAppSettings } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WHATSAPP_TEMPLATE_HINT } from "@/lib/whatsapp-settings";
import type { AppSettings } from "@/types/database";

export function SettingsManager({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    whatsapp_number: settings.whatsapp_number,
    whatsapp_message_template: settings.whatsapp_message_template,
    pix_key: settings.pix_key,
    pix_merchant_name: settings.pix_merchant_name,
    pix_merchant_city: settings.pix_merchant_city,
  });

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await saveAppSettings(form);
        router.refresh();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Não foi possível salvar as configurações.",
        );
      }
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card padding="lg" className="border border-border/80">
        <h2 className="text-lg font-bold text-foreground">PIX (Pagar agora)</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Gera QR Code e Pix copia e cola no checkout com o valor do pedido.
          Use nome e cidade sem acentos (padrão do Banco Central).
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="pix_key"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Chave PIX
            </label>
            <input
              id="pix_key"
              type="text"
              autoComplete="off"
              placeholder="E-mail, CPF, CNPJ, telefone ou chave aleatória"
              value={form.pix_key}
              onChange={(e) => setForm({ ...form, pix_key: e.target.value })}
              className="input-field text-base"
            />
          </div>
          <div>
            <label
              htmlFor="pix_merchant_name"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Nome do recebedor (máx. 25 caracteres)
            </label>
            <input
              id="pix_merchant_name"
              type="text"
              maxLength={25}
              placeholder="Ex.: Telegrama Legal"
              value={form.pix_merchant_name}
              onChange={(e) =>
                setForm({ ...form, pix_merchant_name: e.target.value })
              }
              className="input-field text-base"
            />
          </div>
          <div>
            <label
              htmlFor="pix_merchant_city"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Cidade (máx. 15 caracteres)
            </label>
            <input
              id="pix_merchant_city"
              type="text"
              maxLength={15}
              placeholder="Ex.: Sao Paulo"
              value={form.pix_merchant_city}
              onChange={(e) =>
                setForm({ ...form, pix_merchant_city: e.target.value })
              }
              className="input-field text-base"
            />
          </div>
        </div>
      </Card>

      <Card padding="lg" className="border border-border/80">
        <h2 className="text-lg font-bold text-foreground">WhatsApp do pedido</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Após o PIX, o cliente finaliza o pedido e abre o WhatsApp para enviar
          o comprovante.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="whatsapp_number"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Número do WhatsApp
            </label>
            <input
              id="whatsapp_number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="5511999999999"
              value={form.whatsapp_number}
              onChange={(e) =>
                setForm({ ...form, whatsapp_number: e.target.value })
              }
              className="input-field text-base"
            />
          </div>

          <div>
            <label
              htmlFor="whatsapp_message_template"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Mensagem enviada ao abrir o WhatsApp
            </label>
            <textarea
              id="whatsapp_message_template"
              rows={10}
              value={form.whatsapp_message_template}
              onChange={(e) =>
                setForm({
                  ...form,
                  whatsapp_message_template: e.target.value,
                })
              }
              className="input-field min-h-[12rem] resize-y font-mono text-sm leading-relaxed"
            />
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {WHATSAPP_TEMPLATE_HINT}
            </p>
          </div>
        </div>

        {error && (
          <p
            className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          variant="primary"
          className="mt-6 w-full sm:w-auto"
          disabled={pending}
          onClick={submit}
        >
          {pending ? "Salvando…" : "Salvar configurações"}
        </Button>
      </Card>
    </div>
  );
}
