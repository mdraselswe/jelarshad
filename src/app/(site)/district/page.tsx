import { MapPinIcon } from "lucide-react";
import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { buildAreaOptions } from "@/features/catalog/area-options";
import { AreaFilter } from "@/features/catalog/components/area-filter";
import { IndexPage } from "@/features/catalog/components/index-page";
import { filterText } from "@/features/catalog/filter-text";
import { getDistrictIndex } from "@/features/catalog/queries";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("index.districtsTitle"),
  description: getT()("index.districtsLead"),
  path: routes.districts(),
});

export default async function Districts() {
  const t = getT();
  const districts = await getDistrictIndex();
  const divisions = [...new Set(districts.map((district) => district.divisionBn))];
  return (
    <IndexPage title={t("index.districtsTitle")} lead={t("index.districtsLead")} tone="district">
      <div data-filter-root>
        <AreaFilter
          areas={buildAreaOptions(districts.map((district) => ({ area: district.divisionBn })))}
          showSearch
        />
        {divisions.map((division) => (
          <div key={division} data-filter-section>
            <Section title={division} icon={<MapPinIcon />} tone="teal">
              <GroupedList split>
                {districts
                  .filter((district) => district.divisionBn === division)
                  .map((district) => (
                    <ListRow
                      key={district.slug}
                      href={routes.district(district.slug)}
                      leading={
                        <ListTile tone="district">
                          <MapPinIcon />
                        </ListTile>
                      }
                      title={district.nameBn}
                      meta={
                        district.placeCount > 0
                          ? t("index.places", { count: formatNumber(district.placeCount) })
                          : t("index.noPlaces")
                      }
                      data={{
                        "data-filter-key": district.divisionBn,
                        "data-filter-text": filterText(district.nameBn, district.slug),
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
