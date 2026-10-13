import { useId, type ReactNode } from "react";

import { IconChip, type IconChipTone } from "@/components/ui/icon-chip";
import { cn } from "@/lib/cn";

import { HillEdge, TreeEdge } from "@/components/illustration/world-art";

import { WaveDivider } from "./wave-divider";

// A full-width section with its own ground (docs/06-design-system.md §2d): teal for missions and
// progress, warm for browsing districts and foods, mint for places and maps, night for rewards.
// `edge` is the top of the band: water waves, hills or a row of trees, so the page does not repeat
// one wave everywhere.
const TONES = {
  teal: { wave: "text-band-teal", ground: "band-teal text-on-hero", chip: "teal", edge: "hills" },
  night: {
    wave: "text-band-night",
    ground: "band-night text-on-hero",
    chip: "violet",
    edge: "hills",
  },
  warm: {
    wave: "text-band-warm",
    ground: "band-warm text-foreground",
    chip: "amber",
    edge: "trees",
  },
  mint: {
    wave: "text-band-mint",
    ground: "band-mint text-foreground",
    chip: "green",
    edge: "wave",
  },
} as const satisfies Record<
  string,
  { wave: string; ground: string; chip: IconChipTone; edge: "wave" | "hills" | "trees" }
>;

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
  /** No wave and no gap: the band starts with a straight edge, directly under the section above. */
  flush?: boolean;
};

/**
 * Wave on top, tinted or gradient ground below, content inside the page gutter. On desktop the band
 * runs edge to edge while its content keeps the 1200px column.
 */
export function Band({
  tone,
  title,
  icon,
  action,
  children,
  className,
  gap = true,
  flush = false,
}: BandProps) {
  const headingId = useId();
  const style = TONES[tone];
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn(
        "animate-rise lg:ml-[calc(50%-50vw)] lg:w-screen",
        gap && !flush && "mt-7",
        className,
      )}
    >
      {flush ? null : style.edge === "hills" ? (
        <HillEdge className={style.wave} />
      ) : style.edge === "trees" ? (
        <TreeEdge className={style.wave} />
      ) : (
        <WaveDivider className={style.wave} />
      )}
      <div className={cn(flush ? "" : "-mt-px", style.ground)}>
        <div
          className={cn(
            "page-x pb-7 lg:mx-auto lg:max-w-[1200px] lg:pt-4 lg:pb-12",
            flush ? "pt-6" : "pt-2",
          )}
        >
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
