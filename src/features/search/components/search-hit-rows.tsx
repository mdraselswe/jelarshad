import { MapPinIcon, StoreIcon, UtensilsIcon } from "lucide-react";

import { ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import type { T } from "@/i18n/t";
import { formatPriceRange } from "@/lib/format/number";
import type { DistrictHit, FoodHit, PlaceHit } from "@/services/search-service";

// One row per kind of hit. Used by the results page and by the typing dropdown, so both look alike.

export function FoodHitRow({ hit }: { hit: FoodHit }) {
  return (
    <ListRow
      href={routes.food(hit.slug)}
      leading={
        <ListTile tone="food">
          <UtensilsIcon />
        </ListTile>
      }
      title={hit.nameBn}
      meta={hit.aboutBn ?? " "}
    />
  );
}

export function PlaceHitRow({ hit, t }: { hit: PlaceHit; t: T }) {
  const price = formatPriceRange(hit.price.min, hit.price.max);
  const type = t(`placeType.${hit.type}`);
  return (
    <ListRow
      href={routes.place(hit.slug)}
      leading={
        <ListTile tone="place">
          <StoreIcon />
        </ListTile>
      }
      title={hit.nameBn}
      meta={[hit.district.nameBn, type, price].filter(Boolean).join(" · ")}
    />
  );
}

export function DistrictHitRow({ hit, t }: { hit: DistrictHit; t: T }) {
  return (
    <ListRow
      href={routes.district(hit.slug)}
      leading={
        <ListTile tone="district">
          <MapPinIcon />
        </ListTile>
      }
      title={hit.nameBn}
      meta={t("search.districtMeta", { division: hit.divisionBn })}
    />
  );
}
