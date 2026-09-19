"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTeam, saveTeamCrud } from "@/app/actions/admin";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { usePaginatedItems } from "@/hooks/use-pagination";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { Team } from "@/types/database";

export function TeamsManager({
  teams,
  pendingByTeam,
}: {
  teams: Team[];
  pendingByTeam: Record<string, number>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const filtered = teams.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase()),
  );

  const { visible, page, setPage, pages, totalItems, pageSize } =
    usePaginatedItems(filtered, DEFAULT_PAGE_SIZE, search);

  const startNew = () => {
    setEditing("new");
    setNome("");
  };

  const startEdit = (team: Team) => {
    setEditing(team.id);
    setNome(team.nome);
  };

  const save = () => {
    startTransition(async () => {
      await saveTeamCrud(editing === "new" ? null : editing, { nome });
      setEditing(null);
      setNome("");
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Buscar equipe…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1 text-base"
          aria-label="Buscar equipe"
        />
        <Button variant="secondary" onClick={startNew} className="shrink-0">
          Nova equipe
        </Button>
      </div>

      {(editing === "new" || editing) && (
        <Card className="border border-border">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Nome da equipe
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input-field text-base"
            placeholder="Ex: Cozinha"
          />
          <div className="mt-4 flex gap-2">
            <Button variant="primary" disabled={pending || !nome.trim()} onClick={save}>
              Salvar
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma equipe cadastrada"
          description="Crie equipes para organizar as entregas do encontro."
          icon={<Users className="h-7 w-7" strokeWidth={1.75} />}
          action={
            <Button variant="primary" onClick={startNew}>
              Criar primeira equipe
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((team) => {
            const pend = pendingByTeam[team.id] ?? 0;
            return (
              <li key={team.id}>
                <Card className="border border-border/80">
                  <div className="flex items-start gap-3">
                    <Avatar name={team.nome} />
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-foreground">
                        {team.nome}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {pend > 0
                          ? `${pend} entrega${pend > 1 ? "s" : ""} pendente${pend > 1 ? "s" : ""}`
                          : "Tudo em dia"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(team)}
                      className="min-h-10 flex-1 rounded-xl bg-primary-soft text-sm font-semibold text-primary"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(team);
                      }}
                      className="min-h-10 rounded-xl px-4 text-sm font-semibold text-accent"
                    >
                      Remover
                    </button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > 0 && (
        <PaginationControls
          page={page}
          totalPages={pages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover equipe?"
        description={
          deleteTarget
            ? `A equipe “${deleteTarget.nome}” será excluída permanentemente.`
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
            const result = await deleteTeam(deleteTarget.id);
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
