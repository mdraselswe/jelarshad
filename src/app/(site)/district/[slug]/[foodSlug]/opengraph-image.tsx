import { getDistrictFood } from "@/features/district/queries";
import { getT } from "@/i18n/server";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/features/share/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "জেলার স্বাদ";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; foodSlug: string }>;
}) {
  const { slug, foodSlug } = await params;
  const data = await getDistrictFood(slug, foodSlug);
  const t = getT();
  if (!data) return ogCard({ title: t("notFound.title") });
  return ogCard({
    eyebrow: data.district.nameBn,
    title: t("district.titleFood", { district: data.district.nameBn, food: data.food.nameBn }),
    subtitle: data.noteBn ?? data.food.aboutBn,
  });
}
