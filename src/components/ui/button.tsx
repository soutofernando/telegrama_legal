import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-muted transition-colors hover:bg-primary-soft hover:text-primary",
  danger:
    "inline-flex min-h-11 items-center justify-center rounded-xl bg-accent-soft px-4 text-sm font-semibold text-accent transition-colors hover:bg-accent/20",
  soft:
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary-soft px-4 text-sm font-semibold text-primary transition-colors active:scale-[0.98]",
} as const;

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <button
      type="button"
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
