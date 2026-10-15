import { PhotoShowcase } from "@/features/media/components/photo-showcase";
import { getT } from "@/i18n/server";

import { getPlacePhotos } from "../queries";

/** Photos people shared, right under the hero; nothing is shown (and no space kept) when there are none. */
export async function PlacePhotosSection({ placeId }: { placeId: string }) {
  const t = getT();
  const photos = await getPlacePhotos(placeId);
  if (photos.length === 0) return null;
  return <PhotoShowcase photos={photos} label={t("photos.section")} />;
}
