import Link from "next/link";
import type { ReactNode } from "react";

import { SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { toneClass } from "@/lib/tone";
import type { HomeFamous } from "@/services/catalog-service";

// Card in the "famous for" row. Link and skeleton share one class string and one body, so the
// skeleton has exactly the real card's size (docs/05-loading-skeletons.md §3).
export const FAMOUS_CARD_CLASS =
  "flex w-44 shrink-0 snap-start flex-col gap-2.5 rounded-card-lg border border-border bg-card p-3.5 md:w-auto";

function FamousFoodCardBody({
  title,
  subtitle,
  tile,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  tile: ReactNode;
}) {
  return (
    <>
      {tile}
      <div>
        <div className="line-clamp-1 text-card-title">{title}</div>
        <div className="line-clamp-1 text-meta text-muted-foreground">{subtitle}</div>
      </div>
    </>
  );
}

const TILE_CLASS =
  "flex size-12 items-center justify-center rounded-thumb font-display text-2xl font-bold";

export function FamousFoodCard({ item }: { item: HomeFamous }) {
  return (
    <Link
      href={routes.districtFood(item.district.slug, item.food.slug)}
      className={`${FAMOUS_CARD_CLASS} press`}
    >
      <FamousFoodCardBody
        title={item.food.nameBn}
        subtitle={item.district.nameBn}
        tile={
          <span aria-hidden className={`${TILE_CLASS} ${toneClass(item.food.slug)}`}>
            {item.food.nameBn.slice(0, 1)}
          </span>
        }
      />
    </Link>
  );
}

export function FamousFoodCardSkeleton() {
  return (
    <div className={FAMOUS_CARD_CLASS}>
      <FamousFoodCardBody
        title={<SkeletonText className="w-3/4" />}
        subtitle={<SkeletonText className="w-1/2" />}
        tile={<span aria-hidden className={`${TILE_CLASS} bg-muted`} />}
      />
    </div>
  );
}
