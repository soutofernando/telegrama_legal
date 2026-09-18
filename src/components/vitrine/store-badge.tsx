export function StoreBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "accent" | "secondary" | "outline";
}) {
  const styles = {
    default: "bg-primary text-white",
    accent: "bg-accent text-white",
    secondary: "bg-secondary-soft text-neutral-900",
    outline: "border border-primary/20 bg-white text-primary",
  }[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}
