import type { ReactNode } from "react";

import { ListRow, ListRowSkeleton, ListTile } from "@/components/ui/grouped-list";
import { RankBadge } from "@/components/ui/rank-badge";
import { ScorePill } from "@/components/ui/score-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import { formatNumber, formatPriceRange } from "@/lib/format/number";
import type { DishDisplay } from "@/lib/ranking/display";

type DishRowProps = {
  href: string;
  title: string;
  /** Place details (area, district) or nothing. */
  context?: string | null;
  price: { min: number | null; max: number | null };
  experienceCount: number;
  display: DishDisplay;
  /** 1-based rank among ranked dishes; leave undefined for unranked ("নতুন") rows. */
  rank?: number | undefined;
  /** Replaces the rank badge (e.g. a food icon on a place page). */
  leading?: ReactNode;
};

/**
 * One dish in a grouped list: rank, name, "where · price · N people" and the ❤️ % pill. The same row
 * serves the food page (place-centric) and the place page (food-centric).
 */
export function DishRow({
  href,
  title,
  context,
  price,
  experienceCount,
  display,
  rank,
  leading,
}: DishRowProps) {
  const t = getT();
  const meta = [
    context,
    formatPriceRange(price.min, price.max),
    experienceCount > 0 ? t("dish.people", { count: formatNumber(experienceCount) }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <ListRow
      href={href}
      leading={
        leading ??
        (rank ? <RankBadge rank={rank} /> : <ListTile seed={title}>{title.slice(0, 1)}</ListTile>)
      }
      title={title}
      meta={meta || " "}
      trailing={<ScorePill display={display} />}
    />
  );
}

export function DishRowSkeleton() {
  return (
    <ListRowSkeleton
      hasTrailing={false}
      trailing={<Skeleton className="h-7 w-14 rounded-[10px]" />}
    />
  );
}
