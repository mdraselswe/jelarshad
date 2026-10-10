import { StoreIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListRowSkeleton, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { formatPriceRange } from "@/lib/format/number";

import { getDistrictPlaces } from "../queries";

const SKELETON_ROWS = 4;

export async function DistrictPlacesSection({ districtId }: { districtId: number }) {
  const t = getT();
  const { items } = await getDistrictPlaces(districtId);
  return (
    <Section title={t("district.places")}>
      {items.length === 0 ? (
        <p className="text-meta text-muted-foreground">{t("district.noPlaces")}</p>
      ) : (
        <GroupedList split>
          {items.map((place) => (
            <ListRow
              key={place.slug}
              href={routes.place(place.slug)}
              leading={
                <ListTile tone="place">
                  <StoreIcon />
                </ListTile>
              }
              title={place.nameBn}
              meta={
                [
                  t(`placeType.${place.type}`),
                  place.areaNameBn,
                  formatPriceRange(place.price.min, place.price.max),
                ]
                  .filter(Boolean)
                  .join(" · ") || " "
              }
            />
          ))}
        </GroupedList>
      )}
    </Section>
  );
}

export function DistrictPlacesSectionSkeleton() {
  const t = getT();
  return (
    <Section title={t("district.places")}>
      <GroupedList>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <ListRowSkeleton key={index} />
        ))}
      </GroupedList>
    </Section>
  );
}
