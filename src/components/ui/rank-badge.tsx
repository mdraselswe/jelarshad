import { toBnDigits } from "@/lib/format/number";
import { cn } from "@/lib/cn";

/** 32px rounded square: #1 is primary, the rest are muted (docs/06-design-system.md §6). */
export const RANK_BADGE_CLASS =
  "flex size-8 shrink-0 items-center justify-center rounded-[10px] font-display text-[15px] font-bold";

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        RANK_BADGE_CLASS,
        rank === 1
          ? "bg-primary bg-grad-action text-primary-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {toBnDigits(rank)}
    </span>
  );
}
