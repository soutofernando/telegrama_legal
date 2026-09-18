/** Section wrapper — animations removed for stable layout on mobile */
export function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  return <div className={className}>{children}</div>;
}
