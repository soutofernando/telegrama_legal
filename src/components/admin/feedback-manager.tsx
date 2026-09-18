"use client";

import { useMemo, useState, useTransition } from "react";
import {
  updateFeedbackAdminNoteAction,
  updateFeedbackStatusAction,
} from "@/app/actions/feedback";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format";
import {
  FEEDBACK_STATUS_BADGE,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_TYPE_LABELS,
} from "@/lib/feedback-labels";
import type {
  CustomerFeedbackWithTeam,
  FeedbackStatus,
  FeedbackType,
} from "@/types/database";
import { MessageSquare } from "lucide-react";

export function FeedbackManager({
  items,
}: {
  items: CustomerFeedbackWithTeam[];
}) {
  const [pending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<"" | FeedbackType>("");
  const [statusFilter, setStatusFilter] = useState<"" | FeedbackStatus>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (typeFilter && item.tipo !== typeFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
    });
  }, [items, typeFilter, statusFilter]);

  const openItem = (item: CustomerFeedbackWithTeam) => {
    setExpandedId(item.id);
    setNoteDraft(item.nota_admin ?? "");
  };

  const setStatus = (id: string, status: FeedbackStatus) => {
    startTransition(async () => {
      await updateFeedbackStatusAction(id, status);
    });
  };

  const saveNote = (id: string) => {
    startTransition(async () => {
      await updateFeedbackAdminNoteAction(id, noteDraft);
    });
  };

  const newCount = items.filter((i) => i.status === "new").length;

  return (
    <div className="space-y-4">
      {newCount > 0 && (
        <p className="rounded-2xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
          {newCount}{" "}
          {newCount > 1 ? "mensagens novas" : "mensagem nova"} aguardando
          leitura.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | FeedbackType)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(FEEDBACK_TYPE_LABELS) as FeedbackType[]).map((t) => (
            <option key={t} value={t}>{FEEDBACK_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "" | FeedbackStatus)
          }
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {(Object.keys(FEEDBACK_STATUS_LABELS) as FeedbackStatus[]).map((s) => (
            <option key={s} value={s}>{FEEDBACK_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma mensagem"
          description="Quando alguém enviar feedback pela loja, aparece aqui."
          icon={<MessageSquare className="h-7 w-7" strokeWidth={2} />}
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const expanded = expandedId === item.id;
            return (
              <li key={item.id}>
                <Card
                  className="border border-border/60"
                  padding="sm"
                  onClick={() =>
                    expanded ? setExpandedId(null) : openItem(item)
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">{item.assunto}</p>
                      <p className="text-sm text-muted">
                        {item.nome}
                        {item.teams?.nome ? ` · ${item.teams.nome}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">
                        {FEEDBACK_TYPE_LABELS[item.tipo]}
                      </Badge>
                      <Badge variant={FEEDBACK_STATUS_BADGE[item.status]}>
                        {FEEDBACK_STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground">
                    {item.mensagem}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {formatDateTime(item.criado_em)}
                    {item.avaliacao != null && ` · ${item.avaliacao}/5`}
                    {item.contato && ` · ${item.contato}`}
                  </p>

                  {expanded && (
                    <div
                      className="mt-4 border-t border-border/60 pt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {item.mensagem}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(
                          ["new", "in_progress", "resolved"] as FeedbackStatus[]
                        ).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={pending || item.status === s}
                            onClick={() => setStatus(item.id, s)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                              item.status === s
                                ? "bg-primary text-white"
                                : "bg-neutral-100 text-muted"
                            }`}
                          >
                            {FEEDBACK_STATUS_LABELS[s]}
                          </button>
                        ))}
                      </div>

                      <label className="mt-4 block text-xs font-semibold text-muted">
                        Nota interna (só admin)
                      </label>
                      <textarea
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        rows={3}
                        className="input-field mt-1 min-h-[4rem] resize-y text-sm"
                        placeholder="Ex.: falamos no WhatsApp, pedido reenviado…"
                      />
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => saveNote(item.id)}
                        className="btn-secondary mt-2 text-sm"
                      >
                        Salvar nota
                      </button>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
