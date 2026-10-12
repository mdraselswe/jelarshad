import { getFoodHeader } from "@/features/food/queries";
import { getT } from "@/i18n/server";
import { formatNumber, formatPercent } from "@/lib/format/number";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/features/share/og-card";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "জেলার স্বাদ";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const food = await getFoodHeader(slug);
  const t = getT();
  if (!food) return ogCard({ title: t("notFound.title") });
  const liked =
    food.percent !== null && food.experienceCount > 0
      ? `${t("food.liked", { percent: formatPercent(food.percent) })} · ${t("food.experienceCount", { count: formatNumber(food.experienceCount) })}`
      : null;
  return ogCard({
    eyebrow: food.famousIn[0] ? t("food.famousIn", { district: food.famousIn[0].nameBn }) : null,
    title: food.nameBn,
    subtitle: liked ?? food.aboutBn,
  });
}
