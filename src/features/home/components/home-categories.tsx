import {
  CakeSliceIcon,
  CandyIcon,
  CoffeeIcon,
  CookieIcon,
  CookingPotIcon,
  EggFriedIcon,
  FishIcon,
  IceCreamBowlIcon,
  LayoutGridIcon,
  UtensilsIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/layout/panel";
import { HOME_CATEGORIES } from "@/config/home";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";

const ICONS: Record<string, LucideIcon> = {
  biryani: CookingPotIcon,
  sweets: CakeSliceIcon,
  doi: IceCreamBowlIcon,
  fish: FishIcon,
  breakfast: EggFriedIcon,
  tea: CoffeeIcon,
  pitha: CookieIcon,
  more: LayoutGridIcon,
};

/**
 * Eight food kinds (docs/design) as gradient icon tiles in one panel. A tile opens a search for its
 * name. Static: no data, so no skeleton.
 */
export function HomeCategories() {
  const t = getT();
  return (
    <Panel
      title={t("home.categoriesTitle")}
      icon={<UtensilsIcon />}
      tone="coral"
      className="pt-5 lg:pt-7"
    >
      <ul
        aria-label={t("home.categories")}
        className="grid grid-cols-4 gap-y-4 lg:grid-cols-8 lg:gap-3.5"
      >
        {HOME_CATEGORIES.map((category, index) => {
          const label = t(category.label);
          const Icon = ICONS[category.id] ?? CandyIcon;
          return (
            <li key={category.id}>
              <Link
                href={category.id === "more" ? routes.search() : routes.search({ q: label })}
                className="flex press flex-col items-center gap-2 lg:rounded-card-lg lg:border lg:border-border lg:bg-primary-soft/40 lg:px-2 lg:py-4"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-[58px] items-center justify-center rounded-[20px] text-on-hero shadow-card lg:size-[62px]",
                    category.tile,
                    index % 2 === 0 ? "animate-fx-float" : "animate-fx-float-b",
                  )}
                >
                  <Icon className="size-7" />
                </span>
                <span className="text-center text-[13px] font-medium lg:text-[14.5px] lg:font-semibold">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
