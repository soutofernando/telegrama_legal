"use client";

import { useState, useTransition } from "react";
import { submitFeedbackAction } from "@/app/actions/feedback";
import type { FeedbackType, Team } from "@/types/database";
import { TeamSelect } from "@/components/ui/team-select";
import { FEEDBACK_TYPE_LABELS } from "@/lib/feedback-labels";

const TYPES: FeedbackType[] = ["feedback", "complaint", "suggestion"];

export function FeedbackForm({ teams }: { teams: Team[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const [tipo, setTipo] = useState<FeedbackType>("feedback");
  const [nome, setNome] = useState("");
  const [equipeId, setEquipeId] = useState("");
  const [contato, setContato] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [avaliacao, setAvaliacao] = useState<number | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitFeedbackAction({
        tipo,
        nome,
        equipeId: equipeId || undefined,
        contato: contato || undefined,
        assunto,
        mensagem,
        avaliacao: tipo === "feedback" ? avaliacao ?? undefined : undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-lg font-bold text-foreground">Mensagem enviada!</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Obrigado por compartilhar. Nossa equipe vai ler com carinho e, se
          precisar, entrará em contato pelo WhatsApp ou telefone informado.
        </p>
        <button
          type="button"
          className="btn-secondary mt-6 w-full sm:w-auto"
          onClick={() => {
            setSent(false);
            setAssunto("");
            setMensagem("");
            setAvaliacao(null);
          }}
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-neutral-700">Tipo de mensagem</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {TYPES.map((t) => (
            <label
              key={t}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border-2 px-3 py-3 text-center text-sm font-semibold transition-colors ${
                tipo === t
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-muted"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                className="sr-only"
                checked={tipo === t}
                onChange={() => setTipo(t)}
              />
              {FEEDBACK_TYPE_LABELS[t]}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Seu nome
          </label>
          <input
            required
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input-field"
            placeholder="Como podemos te chamar?"
          />
        </div>
        <TeamSelect
          label="Sua equipe"
          optional
          teams={teams}
          value={equipeId}
          onChange={setEquipeId}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            WhatsApp ou e-mail{" "}
            <span className="font-normal text-muted">(opcional)</span>
          </label>
          <input
            type="text"
            autoComplete="tel"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            className="input-field"
            placeholder="Para retorno, se necessário"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Assunto
          </label>
          <input
            required
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            className="input-field"
            placeholder="Resumo em poucas palavras"
            maxLength={120}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Mensagem
          </label>
          <textarea
            required
            rows={5}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="input-field min-h-[7rem] resize-y"
            placeholder="Conte o que aconteceu ou sua sugestão com detalhes…"
            maxLength={2000}
          />
        </div>

        {tipo === "feedback" && (
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">
              Como foi sua experiência?{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAvaliacao(n)}
                  className={`flex h-11 min-w-11 items-center justify-center rounded-xl border-2 text-sm font-bold transition-colors ${
                    avaliacao === n
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-background text-muted"
                  }`}
                  aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                >
                  {n}★
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-2xl bg-ecri-red/10 px-4 py-3 text-sm font-medium text-ecri-red">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
