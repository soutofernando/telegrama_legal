const STEPS = ["Pedido", "Dados", "Confirmação"] as const;

export function CheckoutStepper({ active = 1 }: { active?: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < active;
        const current = step === active;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                done
                  ? "bg-primary text-white"
                  : current
                    ? "bg-primary text-white ring-4 ring-primary/15"
                    : "bg-background text-muted"
              }`}
            >
              {done ? "✓" : step}
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wide ${
                current ? "text-primary" : "text-muted"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
