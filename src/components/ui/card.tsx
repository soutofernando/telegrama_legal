import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "md",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const pad =
    padding === "none"
      ? ""
      : padding === "sm"
        ? "p-3"
        : padding === "lg"
          ? "p-6"
          : "p-4";
  const interactive = onClick
    ? "cursor-pointer transition-transform active:scale-[0.99] hover:shadow-md"
    : "";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-2xl bg-card shadow-[var(--shadow-card)] ${pad} ${interactive} ${className}`}
    >
      {children}
    </div>
  );
}
