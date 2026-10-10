import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

const TONE = {
  home: "bg-hero-home",
  food: "bg-hero-food",
  place: "bg-hero-place",
  district: "bg-hero-district",
} as const;

export type HeroTone = keyof typeof TONE;

type HeroBandProps = {
  tone: HeroTone;
  children: ReactNode;
  className?: string;
};

/**
 * The gradient banner at the top of home, food, place and district pages (docs/06-design-system.md
 * §2c). White text on the gradient passes AA in every theme; the two soft circles are part of the
 * background, so the band is a single painted layer.
 */
export function HeroBand({ tone, children, className }: HeroBandProps) {
  return (
    <section className="page-x pt-1 lg:pt-5">
      <div
        className={cn(
          "animate-rise rounded-[28px] p-5 text-on-hero lg:rounded-[40px] lg:p-12",
          TONE[tone],
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
