import { getDistrictHeader } from "@/features/district/queries";
import { getT } from "@/i18n/server";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/features/share/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "জেলার স্বাদ";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const district = await getDistrictHeader(slug);
  const t = getT();
  if (!district) return ogCard({ title: t("notFound.title") });
  return ogCard({
    eyebrow: t("search.districtMeta", { division: district.divisionBn }),
    title: district.nameBn,
    subtitle: district.famous.map((entry) => entry.food.nameBn).join(" · ") || null,
  });
}
