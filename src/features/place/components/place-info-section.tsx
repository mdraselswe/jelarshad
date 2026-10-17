import { ClockIcon, GlobeIcon, InfoIcon, MapIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { phoneHref } from "@/lib/place-contact";
import type { PlaceHeader } from "@/services/catalog-service";

import { mapSearchUrl } from "../map-url";

/** The host of a web address without "www.", for the row's second line. */
function hostOf(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * How to reach the place: a call button, its website or Facebook page, opening hours, address with
 * an external map link (no map is embedded in the MVP), and more places nearby. Each row appears
 * only when the fact is known.
 */
export function PlaceInfoSection({ place }: { place: PlaceHeader }) {
  const t = getT();
  return (
    <Section title={t("place.info")} icon={<InfoIcon />} tone="sky">
      <GroupedList>
        {place.phone ? (
          <ListRow
            href={phoneHref(place.phone)}
            leading={
              <ListTile tone="food">
                <PhoneIcon />
              </ListTile>
            }
            title={t("place.call")}
            meta={place.phone}
          />
        ) : null}
        {place.website ? (
          <ListRow
            href={place.website}
            external
            leading={
              <ListTile>
                <GlobeIcon />
              </ListTile>
            }
            title={t("place.website")}
            meta={hostOf(place.website)}
          />
        ) : null}
        {place.hoursText ? (
          <ListRow
            leading={
              <ListTile>
                <ClockIcon />
              </ListTile>
            }
            title={t("place.hours")}
            meta={place.hoursText}
          />
        ) : null}
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
