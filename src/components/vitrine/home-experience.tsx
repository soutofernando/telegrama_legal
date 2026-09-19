"use client";

import { HomeHero } from "@/components/vitrine/home-hero";
import { HowItWorks } from "@/components/vitrine/how-it-works";

export function HomeExperience() {
  return (
    <div className="overflow-x-clip">
      <HomeHero />
      <HowItWorks />
    </div>
  );
}
