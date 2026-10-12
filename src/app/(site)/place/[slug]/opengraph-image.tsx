import { getPlaceHeader } from "@/features/place/queries";
import { getT } from "@/i18n/server";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/features/share/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "জেলার স্বাদ";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getPlaceHeader(slug);
  const t = getT();
  if (!place) return ogCard({ title: t("notFound.title") });
  return ogCard({
    eyebrow: t(`placeType.${place.type}`),
    title: place.nameBn,
    subtitle: [place.areaNameBn, place.district.nameBn].filter(Boolean).join(", "),
  });
}
