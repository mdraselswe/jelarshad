import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";

/** The numeral tile of a ranked row: gold for first, soft indigo for the rest (approved canvas). */
export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-[16px] font-display text-[21px] font-extrabold",
        rank === 1
          ? "bg-grad-reward text-on-reward"
          : rank === 2
            ? "bg-muted text-foreground"
            : "bg-primary-soft text-primary-soft-fg",
        className,
      )}
    >
      {formatNumber(rank)}
    </span>
  );
}
