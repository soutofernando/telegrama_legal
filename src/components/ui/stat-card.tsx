import Link from "next/link";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-center gap-2 text-muted">
        {icon && (
          <span className="flex text-primary" aria-hidden>
            {icon}
          </span>
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </>
  );

  const className =
    "block rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-md active:scale-[0.99]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
