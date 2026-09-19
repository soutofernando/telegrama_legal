"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

type CatalogPrimaryCtaProps = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  /** Larger variant for hero and closing block */
  size?: "hero" | "section";
};

export function CatalogPrimaryCta({
  href = "/loja",
  children,
  className = "",
  size = "hero",
}: CatalogPrimaryCtaProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    if (isMobile) return;

    let ctx: { revert: () => void } | undefined;

    void import("gsap").then((gsapMod) => {
      const gsap = gsapMod.default;
      ctx = gsap.context(() => {
        gsap.to(el, {
          boxShadow:
            "0 0 0 4px rgb(255 222 89 / 0.55), 0 12px 32px -6px rgb(0 74 173 / 0.45)",
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, el);
    });

    return () => ctx?.revert();
  }, []);

  const sizeClass =
    size === "hero"
      ? "lp-cta-primary lp-cta-primary--hero touch-target"
      : "lp-cta-primary lp-cta-primary--section touch-target";

  return (
    <Link ref={ref} href={href} className={`${sizeClass} ${className}`.trim()}>
      <span className="lp-cta-primary__shine" aria-hidden />
      <span className="relative z-[1] flex items-center justify-center gap-2">
        {children}
        <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
      </span>
    </Link>
  );
}
