import type { PlaceType } from "@/core/domain";
import type { Repositories } from "@/core/ports";
import { cleanHours, cleanPhone, cleanWebsite } from "@/lib/place-contact";

import { cleanSearchNames, placeNames } from "./place-names";

// Applying one edited field of a place (an approved suggestion, or its creator's own correction).
// One place for the rules, so an admin and a creator cannot end up with different cleaning.

const PLACE_TYPES: readonly PlaceType[] = [
  "restaurant",
  "shop",
  "street_food",
  "bakery",
  "home_kitchen",
  "other",
];

/** Fields the person who added a place may correct straight away; the rest go to an admin. */
export const CREATOR_EDITABLE_FIELDS = [
  "address",
  "phone",
  "website",
  "hours_text",
  "name_en",
  "name_bangla",
  "alias",
] as const;

export type PlaceEditOutcome = "applied" | "invalid" | "unsupported";

/** Cleans and writes one field of a place. "invalid" when the value is not usable for that field. */
export async function applyPlaceFieldEdit(
  places: Pick<Repositories["places"], "update" | "byId" | "aliases" | "addAlias">,
  placeId: string,
  field: string,
  value: string,
): Promise<PlaceEditOutcome> {
  switch (field) {
    case "name_bn":
      await places.update(placeId, { nameBn: value });
      return "applied";
    case "address":
      await places.update(placeId, { address: value });
      return "applied";
    case "phone": {
      const phone = cleanPhone(value);
      if (phone === null) return "invalid";
      await places.update(placeId, { phone });
      return "applied";
    }
    case "website": {
      const website = cleanWebsite(value);
      if (website === null) return "invalid";
      await places.update(placeId, { website });
      return "applied";
    }
    case "hours_text": {
      const hoursText = cleanHours(value);
      if (hoursText === null) return "invalid";
      await places.update(placeId, { hoursText });
      return "applied";
    }
    // The name in the other script ("Ideal" for "আইডিয়াল", or the Bangla name of a place added
    // in English): whichever of the two is Bangla becomes the shown name.
    case "name_en":
    case "name_bangla": {
      const place = await places.byId(placeId);
      if (!place) return "invalid";
      const names = placeNames(place.nameBn, value);
      if (names.extra.length > 0) return applyPlaceFieldEdit(places, placeId, "alias", value);
      await places.update(placeId, { nameBn: names.nameBn, nameEn: names.nameEn });
      return "applied";
    }
    case "alias": {
      const place = await places.byId(placeId);
      if (!place) return "invalid";
      const taken = [place.nameBn, place.nameEn, ...(await places.aliases(placeId))];
      const names = cleanSearchNames([value], taken);
      if (names === null) return "invalid";
      for (const name of names) await places.addAlias(placeId, name.alias, name.key);
      return "applied";
    }
    case "type":
      if (!PLACE_TYPES.includes(value as PlaceType)) return "invalid";
      await places.update(placeId, { type: value as PlaceType });
      return "applied";
    default:
      return "unsupported";
  }
}
