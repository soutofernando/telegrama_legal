import { Clock } from "lucide-react";
import { formatHorarioLabel } from "@/lib/format";

export function DeliveryTime({
  horario,
  className = "",
}: {
  horario: string | null | undefined;
  className?: string;
}) {
  const label = formatHorarioLabel(horario);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary ${className}`}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
      <span>{label}</span>
    </span>
  );
}
