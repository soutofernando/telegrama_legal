"use client";

import { useEffect, useRef } from "react";
import {
  BadgeCheck,
  ClipboardList,
  CreditCard,
  Search,
  ShoppingCart,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/motion";
import { VITRINE_GUTTER } from "@/lib/vitrine-layout";
import { CatalogPrimaryCta } from "@/components/vitrine/catalog-primary-cta";

const STEPS = [
  {
    title: "Catálogo",
    body: "Entre na loja e escolha o que presentear.",
    Icon: Search,
    tone: "primary" as const,
  },
  {
    title: "Carrinho",
    body: "Toque em + ou Adicionar nos produtos.",
    Icon: ShoppingCart,
    tone: "accent" as const,
  },
  {
    title: "Revisão",
    body: "Confira itens no carrinho e toque Continuar.",
    Icon: ClipboardList,
    tone: "secondary" as const,
  },
  {
    title: "Seu pedido",
    body: "Equipe, horário e para quem vai cada item.",
    Icon: BadgeCheck,
    tone: "primary" as const,
  },
  {
    title: "Finalizar",
    body: "Confirme, pague e receba no encontro.",
    Icon: CreditCard,
    tone: "accent" as const,
  },
];

const toneBadge: Record<(typeof STEPS)[number]["tone"], string> = {
  primary: "bg-primary text-white",
  accent: "bg-accent text-white",
  secondary: "bg-secondary text-foreground",
};

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (prefersReducedMotion()) {
      section.querySelectorAll("[data-step]").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      const line = section.querySelector<HTMLElement>("[data-progress-line]");
      if (line) line.style.transform = "scaleX(1)";
      return;
    }

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    let ctx: { revert: () => void } | undefined;

    void import("gsap").then((gsapMod) => {
      void import("gsap/ScrollTrigger").then((stMod) => {
        const gsap = gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          const header = section.querySelector("[data-how-header]");
          if (header) {
            gsap.fromTo(
              header,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: section,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          }

          const steps = section.querySelectorAll<HTMLElement>("[data-step]");
          gsap.set(steps, {
            opacity: 0,
            y: isMobile ? 16 : 24,
            ...(isMobile ? {} : { scale: 0.97 }),
          });

          steps.forEach((step, index) => {
            gsap.to(step, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              ease: isMobile ? "power2.out" : "back.out(1.2)",
              scrollTrigger: {
                trigger: step,
                start: "top 92%",
                once: true,
              },
              delay: index * 0.05,
              onComplete: () => {
                step.dataset.active = "true";
              },
            });
          });

          const line = section.querySelector<HTMLElement>("[data-progress-line]");
          if (line) {
            gsap.fromTo(
              line,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section.querySelector("[data-steps-track]"),
                  start: "top 75%",
                  end: "bottom 60%",
                  scrub: 0.35,
                },
              },
            );
          }

          const closing = section.querySelector("[data-how-closing]");
          if (closing) {
            gsap.fromTo(
              closing,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: closing,
                  start: "top 92%",
                  once: true,
                },
              },
            );
          }
        }, section);
      });
    });

    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`mx-auto max-w-6xl ${VITRINE_GUTTER} py-8 sm:py-14`}
      aria-labelledby="how-it-works-title"
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:rounded-[1.75rem] sm:p-6 lg:p-10">
        <header data-how-header className="max-w-2xl">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-accent">
            Passo a passo
          </p>
          <h2
            id="how-it-works-title"
            className="font-display mt-1 text-xl font-extrabold text-foreground sm:text-3xl"
          >
            Como funciona
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Do catálogo até a confirmação: veja como montar seu pedido e receber
            suas lembranças no encontro.
          </p>
        </header>

        <div className="relative mt-6 sm:mt-10" data-steps-track>
          <div
            className="pointer-events-none absolute left-0 right-0 top-[1.65rem] hidden h-1 origin-left rounded-full bg-border lg:block"
            aria-hidden
          >
            <div
              data-progress-line
              className="h-full w-full origin-left rounded-full bg-gradient-to-r from-primary via-accent to-secondary"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <ol className="relative flex flex-col gap-3 sm:gap-4 lg:grid lg:grid-cols-5 lg:gap-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                data-step
                className="lp-step-card flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 sm:rounded-2xl sm:p-4 lg:flex-col lg:items-center lg:gap-2.5 lg:p-4 lg:text-center"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm lg:h-11 lg:w-11 lg:shadow-md ${toneBadge[step.tone]}`}
                  aria-hidden
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1 lg:w-full">
                  <div className="flex items-center gap-2 lg:flex-col lg:gap-1.5">
                    <step.Icon
                      className="lp-step-icon h-5 w-5 shrink-0 text-primary lg:h-7 lg:w-7"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    <p className="font-display text-[0.9375rem] font-extrabold leading-tight text-foreground sm:text-base">
                      {step.title}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted sm:text-sm lg:mt-1">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div
          data-how-closing
          className="lp-how-closing mt-6 rounded-xl border border-primary/15 p-4 text-center sm:mt-10 sm:rounded-2xl sm:p-8"
        >
          <p className="font-display text-base font-bold text-foreground sm:text-xl">
            Pronto para escolher sua lembrança?
          </p>
          <p className="mt-1 text-sm text-muted">
            O catálogo completo está a um clique.
          </p>
          <CatalogPrimaryCta
            size="section"
            className="mx-auto mt-5 w-full max-w-md sm:mt-6 sm:w-auto"
          >
            Ver catálogo completo
          </CatalogPrimaryCta>
        </div>
      </div>
    </section>
  );
}
