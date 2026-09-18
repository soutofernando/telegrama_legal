export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary ${sizeClass}`}
      aria-hidden
    >
      {initial}
    </span>
  );
}
