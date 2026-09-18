"use client";

import { Music } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteSerenataSong,
  saveSerenataSongCrud,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import type { SerenataSong } from "@/types/database";

export function SerenataSongsManager({ songs }: { songs: SerenataSong[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", sort_order: "" });
  const [deleteTarget, setDeleteTarget] = useState<SerenataSong | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const startNew = () => {
    setEditing("new");
    setForm({ titulo: "", sort_order: String(songs.length + 1) });
  };

  const startEdit = (song: SerenataSong) => {
    setEditing(song.id);
    setForm({
      titulo: song.titulo,
      sort_order: String(song.sort_order),
    });
  };

  const save = () => {
    startTransition(async () => {
      await saveSerenataSongCrud(editing === "new" ? null : editing, form);
      setEditing(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Opções exibidas na página de produtos do tipo serenata.
        </p>
        <Button variant="secondary" onClick={startNew}>
          Nova música
        </Button>
      </div>

      {editing && (
        <Card className="border border-primary/15">
          <p className="mb-4 font-bold text-foreground">
            {editing === "new" ? "Nova música" : "Editar música"}
          </p>
          <div className="space-y-3">
            <input
              placeholder="Título da música"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="input-field text-base"
            />
            <input
              placeholder="Ordem"
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: e.target.value })
              }
              className="input-field text-base"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              variant="primary"
              disabled={pending || !form.titulo.trim()}
              onClick={save}
            >
              Salvar
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {songs.length === 0 ? (
        <EmptyState
          title="Nenhuma música cadastrada"
          description="Cadastre as músicas disponíveis para serenatas."
          icon={<Music className="h-7 w-7" strokeWidth={1.75} />}
          action={
            <Button variant="primary" onClick={startNew}>
              Adicionar música
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {songs.map((song) => (
            <li key={song.id}>
              <Card className="flex items-center justify-between gap-3 border border-border/80">
                <div>
                  <p className="font-bold text-foreground">{song.titulo}</p>
                  <p className="text-sm text-muted">Ordem {song.sort_order}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(song)}
                    className="min-h-10 rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="min-h-10 rounded-xl px-4 text-sm font-semibold text-accent"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget(song);
                    }}
                  >
                    Remover
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover música?"
        description={
          deleteTarget
            ? `“${deleteTarget.titulo}” deixará de aparecer nas serenatas.`
            : ""
        }
        error={deleteError}
        pending={pending}
        onCancel={() => {
          if (pending) return;
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const result = await deleteSerenataSong(deleteTarget.id);
            if (!result.success) {
              setDeleteError(result.error);
              return;
            }
            setDeleteTarget(null);
            setDeleteError(null);
            router.refresh();
          });
        }}
      />
    </div>
  );
}
