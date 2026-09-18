"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift, HandHeart, Heart, ShoppingBag } from "lucide-react";
import type { PublicProduct } from "@/types/database";
import { SITE_NAME } from "@/lib/constants";
import { CATALOG_CATEGORIES } from "@/lib/catalog-helpers";
import { VITRINE_GUTTER } from "@/lib/vitrine-layout";
import { HeroScene } from "@/components/vitrine/hero-scene";
import { AnimatedSection } from "@/components/vitrine/animated-section";
import { HomeCategoryStrip } from "@/components/vitrine/category-carousel";
import { FeaturedProduct } from "@/components/vitrine/featured-product";
import { ProductCarousel } from "@/components/vitrine/product-carousel";

const STEPS = [
  {
    title: "Escolha",
    body: "Navegue pelo catálogo e encontre a lembrança perfeita.",
    Icon: Gift,
  },
  {
    title: "Monte seu pedido",
    body: "Adicione ao carrinho e informe equipe e horário.",
    Icon: ShoppingBag,
  },
  {
    title: "Receba no encontro",
    body: "Levamos a prenda até a equipe indicada no horário combinado.",
    Icon: Heart,
  },
];

export function HomeExperience({
  featured,
  highlights,
  popular,
  maxQuantities,
}: {
  featured: PublicProduct | null;
  highlights: PublicProduct[];
  popular: PublicProduct[];
  maxQuantities: Record<string, number>;
}) {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-card">
        <HeroScene />
        <div
          className={`relative z-10 mx-auto max-w-6xl ${VITRINE_GUTTER} py-6 sm:py-8`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <Image
              src="/ecri.jpg"
              alt="ECRI — Encontro de Crianças com Cristo"
              width={48}
              height={48}
              className="h-11 w-11 shrink-0 rounded-xl object-contain shadow-sm"
              priority
            />
            <p className="text-[0.6875rem] font-semibold uppercase leading-snug tracking-wide text-accent sm:text-xs">
              ECRI · Sagrado Coração de Jesus
            </p>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <HandHeart className="h-4 w-4" aria-hidden />
            Experiência do encontro
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {SITE_NAME}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            Escolha uma lembrança especial para o encontro. Prendas, serenatas e
            surpresas para presentear quem você ama.
          </p>
          <Link href="/loja" className="btn-primary mt-5 inline-flex w-full sm:w-auto">
            Ver catálogo
          </Link>
        </div>
      </section>

      <AnimatedSection className={`mx-auto max-w-6xl ${VITRINE_GUTTER} py-6`}>
        <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-foreground">
          Encontre algo especial
          <Heart className="h-4 w-4 text-primary" aria-hidden />
        </h2>
        <p className="mt-0.5 text-sm text-muted">Escolha por tipo de lembrança</p>
        <div className="mt-3">
          <HomeCategoryStrip categories={CATALOG_CATEGORIES} />
        </div>
      </AnimatedSection>

      {featured && (
        <AnimatedSection className={`mx-auto max-w-6xl ${VITRINE_GUTTER} pb-6`}>
          <FeaturedProduct product={featured} />
        </AnimatedSection>
      )}

      {highlights.length > 0 && (
        <AnimatedSection className={`mx-auto max-w-6xl ${VITRINE_GUTTER} pb-6`}>
          <ProductCarousel
            title="Queridinhos"
            subtitle="Os favoritos do encontro"
            products={highlights}
            tone="highlight"
            variant="compact"
            showQuickAdd
            showFlame
            maxQuantities={maxQuantities}
          />
        </AnimatedSection>
      )}

      {popular.length > 0 && (
        <AnimatedSection className={`mx-auto max-w-6xl ${VITRINE_GUTTER} pb-6`}>
          <ProductCarousel
            title="Mais escolhidos"
            products={popular}
            tone="popular"
            variant="compact"
          />
        </AnimatedSection>
      )}

      <AnimatedSection className={`mx-auto max-w-6xl ${VITRINE_GUTTER} pb-8`}>
        <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-primary">
          É fácil participar
          <Heart className="h-4 w-4" aria-hidden />
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft text-xs font-bold">
                {i + 1}
              </span>
              <step.Icon className="mt-2 h-5 w-5 text-primary" strokeWidth={2} aria-hidden />
              <p className="mt-1.5 font-display text-sm font-bold text-foreground">
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </AnimatedSection>
    </div>
  );
}
