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
  /** A thin loved-share bar under the meta line (place page). */
  showBar?: boolean;
  /** What a client-side list filter matches this row on (area key and searchable text). */
  filter?: { key: string; group?: string; text: string };
};

const BAR_CLASS = "mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-muted";

function LikeBar({ percent }: { percent: number | null }) {
  return (
    <span aria-hidden className={BAR_CLASS}>
      {percent !== null ? (
        <span className="rounded-full bg-success" style={{ width: `${percent}%` }} />
      ) : null}
    </span>
  );
}

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
  showBar = false,
  filter,
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
      footer={showBar ? <LikeBar percent={display.percent} /> : undefined}
      {...(filter
        ? {
            data: {
              "data-filter-key": filter.key,
              "data-filter-group": filter.group ?? "",
              "data-filter-text": filter.text,
            },
          }
        : {})}
    />
  );
}

export function DishRowSkeleton({ withBar = false }: { withBar?: boolean }) {
  return (
    <ListRowSkeleton
      ranked
      footer={withBar ? <span aria-hidden className={BAR_CLASS} /> : undefined}
      hasTrailing={false}
      trailing={<Skeleton className="h-7 w-14 rounded-[10px]" />}
    />
  );
}
