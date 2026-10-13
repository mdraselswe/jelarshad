import { HeartIcon } from "lucide-react";
import Link from "next/link";

import { BowlArt, PileArt, PlateArt, PotArt } from "@/components/illustration/food-art";
import { Panel } from "@/components/layout/panel";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import type { DistrictHeader } from "@/services/catalog-service";

const TOPS = ["bg-kind-orange", "bg-kind-pink", "bg-kind-green", "bg-kind-violet"] as const;
const DISHES = [BowlArt, PlateArt, PotArt, PileArt] as const;

/**
 * The editors' "famous for" list (approved canvas: District): white cards with a colored top and one
 * floating dish, a swipeable row on phones and a grid from 768px; each opens the district×food page.
 * Hidden when empty.
 */
export function DistrictFamousSection({ district }: { district: DistrictHeader }) {
  const t = getT();
  if (district.famous.length === 0) return null;
  return (
    <Panel title={t("district.famous")} icon={<HeartIcon />} tone="coral" className="lg:pt-8">
      <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("home.famousHint")}</p>
      <ul className="-mx-1 flex rise-children snap-x [scrollbar-width:none] gap-3 overflow-x-auto px-1 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
        {district.famous.map(({ food, noteBn }, index) => {
          const Dish = DISHES[index % DISHES.length] ?? BowlArt;
          return (
            <li key={food.slug} className="w-[150px] shrink-0 snap-start md:w-auto">
              <Link
                href={routes.districtFood(district.slug, food.slug)}
                className="block lift press overflow-hidden rounded-[26px] border border-border bg-card shadow-card"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex h-[104px] items-center justify-center",
                    TOPS[index % TOPS.length],
                  )}
                >
                  <Dish className="w-[70px]" />
                </span>
                <span className="block px-3.5 pt-3 pb-3.5">
                  <span className="line-clamp-1 block text-[15px] font-bold">{food.nameBn}</span>
                  <span className="mt-0.5 line-clamp-1 block min-h-[1.25rem] text-[12.5px] text-muted-foreground">
                    {noteBn ?? " "}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
