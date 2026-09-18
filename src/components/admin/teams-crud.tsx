"use client";

import { CrudList } from "@/components/admin/crud-list";
import { deleteTeam, saveTeamCrud } from "@/app/actions/admin";
import type { Team } from "@/types/database";

export function TeamsCrud({ items }: { items: Team[] }) {
  return (
    <CrudList<Team>
      items={items}
      emptyLabel="Nenhuma equipe cadastrada."
      renderLabel={(t) => t.nome}
      fields={[{ key: "nome", label: "Nome da equipe" }]}
      onSave={saveTeamCrud}
      onDelete={deleteTeam}
    />
  );
}
