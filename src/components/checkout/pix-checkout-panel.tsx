"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/format";
import { createOrderPix, isPixConfigured } from "@/lib/pix-settings";
import type { AppSettings } from "@/types/database";

export function PixCheckoutPanel({
  settings,
  amount,
  confirmed,
  onConfirmedChange,
}: {
  settings: AppSettings;
  amount: number;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const pix = useMemo(
    () => createOrderPix(settings, amount),
    [settings, amount],
  );
  const brCode = useMemo(() => pix?.toBRCode() ?? null, [pix]);

  useEffect(() => {
    if (!pix) {
      setQrDataUrl(null);
      return;
    }
    let active = true;
    pix
      .toImage()
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [pix]);

  if (!isPixConfigured(settings)) {
    return (
      <div
        className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        role="status"
      >
        O PIX ainda não foi configurado no painel admin. Escolha outra forma de
        pagamento ou avise a organização.
      </div>
    );
  }

  const copyCode = async () => {
    if (!brCode) return;
    try {
      await navigator.clipboard.writeText(brCode);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border-2 border-ecri-blue/25 bg-ecri-blue/5 p-4">
      <div>
        <p className="text-sm font-bold text-neutral-900">Pague com PIX</p>
        <p className="mt-1 text-sm text-neutral-600">
          Valor:{" "}
          <span className="font-bold text-ecri-blue">
            {formatCurrency(amount)}
          </span>
          . Depois de pagar, marque a confirmação abaixo e finalize o pedido
          para enviar o comprovante no WhatsApp.
        </p>
      </div>

      {qrDataUrl && (
        <div className="flex justify-center">
          <img
            src={qrDataUrl}
            alt="QR Code PIX"
            className="h-52 w-52 rounded-2xl border border-white bg-white p-3 shadow-sm"
            width={208}
            height={208}
          />
        </div>
      )}

      {brCode && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Pix copia e cola
          </p>
          <textarea
            readOnly
            value={brCode}
            rows={4}
            className="input-field font-mono text-xs leading-relaxed"
            aria-label="Código PIX copia e cola"
          />
          <button
            type="button"
            onClick={copyCode}
            className="btn-secondary inline-flex w-full items-center justify-center gap-2 text-sm"
          >
            {copyState === "copied" ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden />
                {copyState === "error" ? "Não foi possível copiar" : "Copiar código PIX"}
              </>
            )}
          </button>
        </div>
      )}

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmedChange(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-ecri-blue"
        />
        <span className="text-sm text-neutral-700">
          <span className="font-semibold text-neutral-900">
            Já realizei o pagamento via PIX
          </span>
          <span className="mt-0.5 block text-neutral-500">
            Só finalize depois de concluir o pagamento no app do seu banco.
          </span>
        </span>
      </label>
    </div>
  );
}
