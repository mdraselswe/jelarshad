import { StoreIcon } from "lucide-react";
import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { AreaFilter } from "@/features/catalog/components/area-filter";
import { IndexPage } from "@/features/catalog/components/index-page";
import { filterText } from "@/features/catalog/filter-text";
import { getBrandIndex } from "@/features/catalog/queries";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("index.brandsTitle"),
  description: getT()("index.brandsLead"),
  path: routes.brands(),
});

export default async function Brands() {
  const t = getT();
  const brands = await getBrandIndex();
  return (
    <IndexPage title={t("index.brandsTitle")} lead={t("index.brandsLead")} tone="district">
      <div data-filter-root>
        <AreaFilter areas={[]} showSearch={brands.length > 6} />
        <div data-filter-section>
          <Section title={t("index.brandsTitle")} icon={<StoreIcon />} tone="violet">
            <GroupedList split>
              {brands.map((brand) => (
                <ListRow
                  key={brand.slug}
                  href={routes.brand(brand.slug)}
                  leading={<ListTile seed={brand.slug}>{brand.nameBn.slice(0, 1)}</ListTile>}
                  title={brand.nameBn}
                  meta={t("index.branches", { count: formatNumber(brand.branchCount) })}
                  data={{
                    "data-filter-key": "",
                    "data-filter-text": filterText(brand.nameBn),
                  }}
                />
              ))}
            </GroupedList>
          </Section>
        </div>
      </div>
    </IndexPage>
  );
}
