import { MapPinIcon, MapIcon } from "lucide-react";

import { InfoIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { PlaceHeader } from "@/services/catalog-service";

import { mapSearchUrl } from "../map-url";

/** Address, an external map link (no map is embedded in the MVP), and more places nearby. */
export function PlaceInfoSection({ place }: { place: PlaceHeader }) {
  const t = getT();
  return (
    <Section title={t("place.info")} icon={<InfoIcon />} tone="sky">
      <GroupedList>
        <ListRow
          href={mapSearchUrl(place.mapQuery)}
          external
          leading={
            <ListTile>
              <MapPinIcon />
            </ListTile>
          }
          title={t("place.map")}
          meta={[place.address ?? place.areaNameBn, t("place.newTab")].filter(Boolean).join(" · ")}
        />
        <ListRow
          href={routes.district(place.district.slug)}
          leading={
            <ListTile>
              <MapIcon />
            </ListTile>
          }
          title={t("place.moreIn", { district: place.district.nameBn })}
          meta={place.district.nameBn}
        />
      </GroupedList>
    </Section>
  );
}
