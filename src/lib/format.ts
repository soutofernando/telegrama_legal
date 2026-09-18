/** Remove emoji/decorative chars often pasted into horário labels. */
export function formatHorarioLabel(horario: string | null | undefined): string {
  if (!horario) return "—";
  return horario
    .replace(/[\u{1F550}-\u{1F567}\u23F0-\u23F3⌚⏰🕐]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}
