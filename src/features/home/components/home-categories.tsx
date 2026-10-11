import Link from "next/link";

import { HOME_CATEGORIES } from "@/config/home";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";

/**
 * Eight food kinds (docs/design). On phones one white card floats over the bottom of the hero; on
 * desktop each kind is its own card in a row. A tile opens a search for its name.
 */
export function HomeCategories() {
  const t = getT();
  return (
    <section
      aria-label={t("home.categories")}
      className="relative z-10 mx-4 -mt-10 animate-rise rounded-[28px] bg-card px-2 py-4 shadow-floating md:mx-7 lg:mx-8 lg:mt-7 lg:bg-transparent lg:p-0 lg:shadow-none"
    >
      <ul className="grid grid-cols-4 gap-y-4 lg:grid-cols-8 lg:gap-3.5">
        {HOME_CATEGORIES.map((category) => {
          const label = t(category.label);
          return (
            <li key={category.id}>
              <Link
                href={category.id === "more" ? routes.search() : routes.search({ q: label })}
                className="flex press flex-col items-center gap-2 lg:rounded-card-lg lg:border lg:border-border lg:bg-card lg:px-2 lg:py-4 lg:shadow-card"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-[54px] items-center justify-center rounded-[18px] font-display text-2xl font-bold lg:size-[58px] lg:rounded-[20px]",
                    category.tone,
                  )}
                >
                  {category.glyph}
                </span>
                <span className="text-center text-[13px] font-medium lg:text-[14.5px] lg:font-semibold">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
