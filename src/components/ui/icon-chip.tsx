import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

// A small rounded square with a white icon on one of the gradient fills (docs/06-design-system.md
// §2d). It heads a panel or band, so every section announces what it is at a glance.
const TONES = {
  violet: "bg-tile-1",
  coral: "bg-tile-2",
  teal: "bg-tile-3",
  amber: "bg-tile-4",
  sky: "bg-tile-5",
  green: "bg-tile-6",
  reward: "bg-grad-reward text-on-reward",
} as const;

export type IconChipTone = keyof typeof TONES;

const SIZES = {
  sm: "size-9 rounded-[12px] [&_svg]:size-5",
  md: "size-12 rounded-[16px] [&_svg]:size-6",
  lg: "size-16 rounded-[22px] [&_svg]:size-8",
} as const;

export function IconChip({
  tone = "violet",
  size = "sm",
  children,
  className,
}: {
  tone?: IconChipTone;
  size?: keyof typeof SIZES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center text-on-hero",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
