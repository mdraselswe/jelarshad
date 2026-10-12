import { useId, type ReactNode } from "react";

import { IconChip, type IconChipTone } from "@/components/ui/icon-chip";
import { cn } from "@/lib/cn";

import { WaveDivider } from "./wave-divider";

// A full-width section with its own ground (docs/06-design-system.md §2d): teal for missions and
// progress, warm for browsing districts and foods, mint for places and maps, night for rewards.
const TONES = {
  teal: { wave: "text-band-teal", ground: "band-teal text-on-hero", chip: "teal" },
  night: { wave: "text-band-night", ground: "band-night text-on-hero", chip: "violet" },
  warm: { wave: "text-band-warm", ground: "band-warm text-foreground", chip: "amber" },
  mint: { wave: "text-band-mint", ground: "band-mint text-foreground", chip: "green" },
} as const satisfies Record<string, { wave: string; ground: string; chip: IconChipTone }>;

export type BandTone = keyof typeof TONES;

type BandProps = {
  tone: BandTone;
  title?: ReactNode;
  icon?: ReactNode;
  /** Right of the title, e.g. a "সব দেখুন" link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Spacing above the wave; the page ground shows in it. */
  gap?: boolean;
};

/**
 * Wave on top, tinted or gradient ground below, content inside the page gutter. On desktop the band
 * runs edge to edge while its content keeps the 1200px column.
 */
export function Band({ tone, title, icon, action, children, className, gap = true }: BandProps) {
  const headingId = useId();
  const style = TONES[tone];
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn("animate-rise lg:ml-[calc(50%-50vw)] lg:w-screen", gap && "mt-7", className)}
    >
      <WaveDivider className={style.wave} />
      <div className={cn("-mt-px", style.ground)}>
        <div className="page-x pt-2 pb-7 lg:mx-auto lg:max-w-[1200px] lg:pt-4 lg:pb-12">
          {title ? (
            <div className="mb-3 flex items-center gap-2.5">
              {icon ? <IconChip tone={style.chip}>{icon}</IconChip> : null}
              <h2 id={headingId} className="min-w-0 flex-1 text-heading">
                {title}
              </h2>
              {action}
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
