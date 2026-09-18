export type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

export function fkBlockMessage(code?: string): string | null {
  if (code === "23503") {
    return "Não é possível remover: existem registros vinculados.";
  }
  return null;
}
