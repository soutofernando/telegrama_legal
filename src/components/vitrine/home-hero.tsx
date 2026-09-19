"use client";

import Image from "next/image";
import { HandHeart } from "lucide-react";
import { useEffect, useRef } from "react";
import { SITE_NAME } from "@/lib/constants";
import { prefersReducedMotion } from "@/lib/motion";
import { VITRINE_GUTTER } from "@/lib/vitrine-layout";
import { CatalogPrimaryCta } from "@/components/vitrine/catalog-primary-cta";
import { HeroScene } from "@/components/vitrine/hero-scene";
import { HeroThreeDecoration } from "@/components/vitrine/hero-three-decoration";

const FLOAT_DECOR = [
  { className: "left-[8%] top-[18%] text-secondary", char: "✦", delay: "0s" },
  { className: "right-[12%] top-[28%] text-accent", char: "♥", delay: "-2s" },
  { className: "right-[22%] bottom-[22%] text-primary", char: "★", delay: "-4s" },
] as const;

export function HomeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    if (prefersReducedMotion()) return;

    let ctx: { revert: () => void } | undefined;

    void import("gsap").then((gsapMod) => {
      const gsap = gsapMod.default;
      const targets = content.querySelectorAll("[data-hero-reveal]");
      ctx = gsap.context(() => {
        gsap.set(targets, { opacity: 0, y: 28 });
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.09,
          ease: "power3.out",
          delay: 0.12,
        });
      }, section);
    });

    return () => ctx?.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border bg-card"
    >
      <HeroScene />
      <HeroThreeDecoration />

      {FLOAT_DECOR.map((item) => (
        <span
          key={item.char + item.className}
          className={`float-star ${item.className} z-[1] hidden text-lg sm:inline`}
          style={{ animationDelay: item.delay }}
          aria-hidden
        >
          {item.char}
        </span>
      ))}

      <div className="gift-3d pointer-events-none absolute -right-6 top-[38%] z-[1] hidden scale-50 opacity-35 sm:block md:hidden">
        <div className="gift-3d-box">
          <div className="gift-3d-body" />
          <div className="gift-3d-lid" />
          <div className="gift-3d-ribbon-v" />
          <div className="gift-3d-ribbon-h" />
        </div>
      </div>

      <div
        ref={contentRef}
        className={`relative z-10 mx-auto max-w-6xl ${VITRINE_GUTTER} py-7 sm:py-12 md:py-14 md:pr-[min(42vw,20rem)]`}
      >
        <div
          data-hero-reveal
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
        >
          <Image
            src="/ecri.jpg"
            alt="ECRI — Encontro de Crianças com Cristo"
            width={56}
            height={56}
            className="h-12 w-12 shrink-0 rounded-xl object-contain shadow-md ring-2 ring-secondary/40 sm:h-14 sm:w-14"
            priority
          />
          <p className="text-[0.6875rem] font-semibold uppercase leading-snug tracking-wide text-accent sm:text-xs">
            ECRI · Sagrado Coração de Jesus
          </p>
        </div>

        <p
          data-hero-reveal
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <HandHeart className="h-4 w-4" aria-hidden />
          Experiência do encontro
        </p>

        <h1
          data-hero-reveal
          className="font-display mt-2 text-3xl font-extrabold leading-[1.08] text-foreground sm:text-4xl sm:leading-[1.05] lg:text-[3.25rem]"
        >
          {SITE_NAME}
        </h1>

        <p
          data-hero-reveal
          className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base"
        >
          Escolha uma lembrança especial para o encontro. Prendas, serenatas e
          surpresas para presentear quem você ama.
        </p>

        <div data-hero-reveal className="mt-7 sm:mt-8">
          <CatalogPrimaryCta size="hero" className="w-full sm:w-auto">
            Ver catálogo
          </CatalogPrimaryCta>
        </div>
      </div>
    </section>
  );
}
