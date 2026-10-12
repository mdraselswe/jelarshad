import { CameraIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { PhotoStrip } from "@/features/media/components/photo-strip";
import { getT } from "@/i18n/server";

import { getPlacePhotos } from "../queries";

/** Photos people shared from this place; nothing is shown (and no space kept) when there are none. */
export async function PlacePhotosSection({ placeId }: { placeId: string }) {
  const t = getT();
  const photos = await getPlacePhotos(placeId);
  if (photos.length === 0) return null;
  return (
    <Section title={t("photos.section")} icon={<CameraIcon />} tone="amber">
      <PhotoStrip photos={photos} label={t("photos.section")} size={104} />
    </Section>
  );
}
