import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { WaveDivider } from "./wave-divider";

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
  /** A faint illustration behind the content (docs/06-design-system.md §2d). */
  art?: ReactNode;
  /** Moving decoration over the whole band, behind the content (confetti). */
  fx?: ReactNode;
  /** A countryside strip along the bottom of the band on phones; give the band room with padding. */
  scene?: ReactNode;
};

/**
 * The gradient banner at the top of home, food, place and district pages (docs/06-design-system.md
 * §2c). White text on the gradient passes AA in every theme; the two soft circles are part of the
 * background, so the band is a single painted layer. From 1024px it is always an inset card.
 */
export function HeroBand({
  tone,
  children,
  className,
  bleed = false,
  bar,
  art,
  fx,
  scene,
}: HeroBandProps) {
  return (
    <section className={bleed ? "lg:page-x lg:pt-5" : "page-x pt-1 lg:pt-5"}>
      <div
        className={cn(
          "relative animate-rise overflow-hidden text-on-hero lg:rounded-[40px] lg:p-12",
          bleed ? "px-5 pt-5 pb-11" : "rounded-[28px] p-5",
          TONE[tone],
          className,
        )}
      >
        {fx}
        {art ? (
          <div
            aria-hidden
            className="pointer-events-none absolute -right-3 -bottom-3 w-40 rotate-6 opacity-20 lg:top-8 lg:right-10 lg:bottom-auto lg:w-56"
          >
            {art}
          </div>
        ) : null}
        {bar ? (
          <div className="mb-4 flex min-h-11 items-center justify-between gap-3 on-hero-actions lg:hidden">
            {bar}
          </div>
        ) : null}
        {scene ? (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
            {scene}
          </div>
        ) : null}
        <div className="relative">{children}</div>
        {bleed ? (
          <WaveDivider className="absolute inset-x-0 -bottom-px text-background lg:hidden" />
        ) : null}
      </div>
    </section>
  );
}
