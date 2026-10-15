import { MapPinIcon, StoreIcon, UtensilsIcon } from "lucide-react";

import { ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import type { T } from "@/i18n/t";
import { formatNumber, formatPriceRange } from "@/lib/format/number";
import type {
  AreaHit,
  BrandGroup,
  DistrictHit,
  FoodHit,
  PlaceHit,
  PlaceRowItem,
} from "@/services/search-service";

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
      meta={[hit.areaNameBn, hit.district.nameBn, type, price].filter(Boolean).join(" · ")}
    />
  );
}

/** Several branches of one chain as one row; the brand page lists each branch separately. */
export function BrandGroupRow({ group, t }: { group: BrandGroup; t: T }) {
  const shown = Array.from(new Set(group.areas)).slice(0, 3).join(", ");
  return (
    <ListRow
      href={routes.brand(group.slug)}
      leading={
        <ListTile tone="place">
          <StoreIcon />
        </ListTile>
      }
      title={group.nameBn}
      meta={t("brand.searchMeta", { count: formatNumber(group.count), areas: shown })}
    />
  );
}

export function PlaceRowItemView({ item, t }: { item: PlaceRowItem; t: T }) {
  return item.kind === "brand" ? (
    <BrandGroupRow group={item.group} t={t} />
  ) : (
    <PlaceHitRow hit={item.hit} t={t} />
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

export function AreaHitRow({ hit, t }: { hit: AreaHit; t: T }) {
  return (
    <ListRow
      href={routes.area(hit.district.slug, hit.slug)}
      leading={
        <ListTile tone="district">
          <MapPinIcon />
        </ListTile>
      }
      title={hit.nameBn}
      meta={t("search.areaMeta", { district: hit.district.nameBn })}
    />
  );
}
