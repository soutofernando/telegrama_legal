export const ADMIN_PRIMARY_NAV = [
  { href: "/admin", label: "Início", match: "exact" as const },
  { href: "/admin/equipes", label: "Equipes", match: "prefix" as const },
  { href: "/admin/itens", label: "Itens", match: "prefix" as const },
  { href: "/admin/produtos", label: "Produtos", match: "prefix" as const },
] as const;

export const ADMIN_MORE_LINKS = [
  {
    href: "/admin/financeiro",
    label: "Financeiro",
    desc: "Vendas e arrecadação",
  },
  { href: "/admin/horarios", label: "Horários", desc: "Janelas de entrega" },
  {
    href: "/admin/serenatas",
    label: "Serenatas",
    desc: "Músicas para o cliente escolher",
  },
  { href: "/admin/itinerario", label: "Itinerário", desc: "Rota no celular" },
  {
    href: "/admin/atendimento",
    label: "Atendimento",
    desc: "Reclamações e feedbacks",
  },
  { href: "/", label: "Abrir loja", desc: "Vitrine pública" },
] as const;

export const ADMIN_DESKTOP_LINKS = [
  ...ADMIN_PRIMARY_NAV.map((n) => ({ href: n.href, label: n.label })),
  ...ADMIN_MORE_LINKS.filter((l) => l.href.startsWith("/admin")).map((l) => ({
    href: l.href,
    label: l.label,
  })),
];
