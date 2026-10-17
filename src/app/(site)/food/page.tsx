import { UtensilsIcon } from "lucide-react";
import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { FOOD_KINDS, OTHER_KIND } from "@/config/food-kinds";
import { routes } from "@/config/routes";
import { buildAreaOptions } from "@/features/catalog/area-options";
import { AreaFilter } from "@/features/catalog/components/area-filter";
import { IndexPage } from "@/features/catalog/components/index-page";
import { filterText } from "@/features/catalog/filter-text";
import { getFoodIndex } from "@/features/catalog/queries";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("index.foodsTitle"),
  description: getT()("index.foodsLead"),
  path: routes.foods(),
});

export default async function Foods() {
  const t = getT();
  const foods = await getFoodIndex();
  const kinds = [...FOOD_KINDS, OTHER_KIND].filter((kind) =>
    foods.some((food) => food.kind.id === kind.id),
  );
  return (
    <IndexPage title={t("index.foodsTitle")} lead={t("index.foodsLead")} tone="food">
      <div data-filter-root>
        <AreaFilter
          areas={buildAreaOptions(foods.map((food) => ({ area: t(food.kind.label) })))}
          showSearch={foods.length > 10}
        />
        {kinds.map((kind) => (
          <div key={kind.id} data-filter-section>
            <Section title={t(kind.label)} icon={<UtensilsIcon />} tone="coral">
              <GroupedList split>
                {foods
                  .filter((food) => food.kind.id === kind.id)
                  .map((food) => (
                    <ListRow
                      key={food.slug}
                      href={routes.food(food.slug)}
                      leading={<ListTile seed={food.slug}>{food.nameBn.slice(0, 1)}</ListTile>}
                      title={food.nameBn}
                      meta={
                        food.placeCount > 0
                          ? t("index.places", { count: formatNumber(food.placeCount) })
                          : t("index.noPlaces")
                      }
                      data={{
                        "data-filter-key": t(food.kind.label),
                        "data-filter-text": filterText(food.nameBn, food.nameEn),
                      }}
                    />
                  ))}
              </GroupedList>
            </Section>
          </div>
        ))}
      </div>
    </IndexPage>
  );
}
