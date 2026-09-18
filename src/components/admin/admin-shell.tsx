import { AdminDesktopNav } from "@/components/admin/admin-desktop-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export function AdminShell({
  children,
  title,
  subtitle,
  action,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AdminDesktopNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              <a href="/admin" className="flex shrink-0 items-center gap-2 md:hidden">
                <img
                  src="/ecri.jpg"
                  alt="ECRI"
                  className="h-9 w-9 rounded-xl object-cover"
                />
              </a>
              <div className="min-w-0 flex-1">
                {title && (
                  <h1 className="truncate text-lg font-bold leading-tight md:text-xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="truncate text-sm text-muted">{subtitle}</p>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
          </header>

          <main className="safe-bottom-nav mx-auto w-full max-w-3xl flex-1 px-4 py-5 md:max-w-4xl md:pb-8 md:px-6 lg:max-w-5xl">
            {children}
          </main>
        </div>
      </div>
      <AdminMobileNav />
    </div>
  );
}
