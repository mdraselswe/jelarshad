import { FlameIcon } from "lucide-react";

import { cn } from "@/lib/cn";
import type { LevelInfo } from "@/lib/gamification/levels";
import { toBnDigits } from "@/lib/format/number";

// Small pieces of the game layer (docs/00-decisions.md P15) shared by home, passport and profile.

const NAMED_LEVELS = 8;
export type LevelKey = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/** The message-file key for a level's name; levels above the named ones keep the last name. */
export function levelNameKey(level: number) {
  const clamped = Math.min(Math.max(1, Math.floor(level)), NAMED_LEVELS) as LevelKey;
  return `game.level.${clamped}` as const;
}

/** A ring that fills as the level's XP fills, with the level number in the middle. */
export function LevelRing({
  info,
  size = 54,
  stroke = 6,
  onDark = false,
  caption,
  className,
}: {
  info: LevelInfo;
  size?: number;
  stroke?: number;
  /** A small word above the number, e.g. "লেভেল". */
  caption?: string;
  /** On a gradient: translucent track, white number. */
  onDark?: boolean;
  className?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={onDark ? "stroke-white/25" : "stroke-muted"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - info.fraction)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ "--ring-from": circumference } as React.CSSProperties}
          className="animate-ring stroke-reward"
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center font-display font-bold",
          onDark ? "text-on-hero" : "text-primary-text",
        )}
      >
        {caption ? (
          <span className="font-sans text-[12px] leading-none font-medium opacity-85">
            {caption}
          </span>
        ) : null}
        <span
          style={{ fontSize: Math.round(size * (caption ? 0.42 : 0.36)) }}
          className="leading-tight"
        >
          {toBnDigits(info.level)}
        </span>
      </span>
    </span>
  );
}

/** A thin bar that fills from the left; `fraction` is 0–1. */
export function XpBar({
  fraction,
  className,
  trackClassName = "bg-muted",
  fillClassName = "bg-grad-reward",
}: {
  fraction: number;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return (
    <span
      aria-hidden
      className={cn("flex h-2.5 overflow-hidden rounded-full", trackClassName, className)}
    >
      <span
        className={cn("origin-left animate-progress rounded-full", fillClassName)}
        style={{ width: `${percent}%` }}
      />
    </span>
  );
}

/** The flame and the number of days in a row; a gray flame while there is no streak. */
export function StreakFlame({
  days,
  label,
  className,
}: {
  days: number;
  /** Accessible text, e.g. "৫ দিন". */
  label: string;
  className?: string;
}) {
  const live = days > 0;
  return (
    <span
      className={cn(
        "flex flex-col items-center gap-0.5 text-caption font-semibold",
        live ? "text-cat-coral-fg" : "text-muted-foreground",
        className,
      )}
    >
      <FlameIcon
        aria-hidden
        className={cn("size-6", live ? "animate-fx-flame fill-reward stroke-cat-coral-fg" : "")}
      />
      <span>{label}</span>
    </span>
  );
}
