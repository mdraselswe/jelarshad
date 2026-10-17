import type { PlaceType } from "@/core/domain";
import type { Repositories } from "@/core/ports";
import { cleanHours, cleanPhone, cleanWebsite } from "@/lib/place-contact";

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
export const CREATOR_EDITABLE_FIELDS = ["address", "phone", "website", "hours_text"] as const;

export type PlaceEditOutcome = "applied" | "invalid" | "unsupported";

/** Cleans and writes one field of a place. "invalid" when the value is not usable for that field. */
export async function applyPlaceFieldEdit(
  places: Pick<Repositories["places"], "update">,
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
    case "type":
      if (!PLACE_TYPES.includes(value as PlaceType)) return "invalid";
      await places.update(placeId, { type: value as PlaceType });
      return "applied";
    default:
      return "unsupported";
  }
}
