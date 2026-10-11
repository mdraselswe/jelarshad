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
  /**
   * Full-bleed on phones (rounded only at the bottom, to the top of the screen) as in the approved
   * screens. Without it the band is an inset rounded card.
   */
  bleed?: boolean;
  /** Top row on phones only (back and share buttons, the brand); it sits on the gradient. */
  bar?: ReactNode;
};

/**
 * The gradient banner at the top of home, food, place and district pages (docs/06-design-system.md
 * §2c). White text on the gradient passes AA in every theme; the two soft circles are part of the
 * background, so the band is a single painted layer. From 1024px it is always an inset card.
 */
export function HeroBand({ tone, children, className, bleed = false, bar }: HeroBandProps) {
  return (
    <section className={bleed ? "lg:page-x lg:pt-5" : "page-x pt-1 lg:pt-5"}>
      <div
        className={cn(
          "animate-rise text-on-hero lg:rounded-[40px] lg:p-12",
          bleed ? "rounded-b-[36px] px-5 pt-5 pb-8" : "rounded-[28px] p-5",
          TONE[tone],
          className,
        )}
      >
        {bar ? (
          <div className="mb-4 flex min-h-11 items-center justify-between gap-3 on-hero-actions lg:hidden">
            {bar}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
