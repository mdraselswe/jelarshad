import { getT } from "@/i18n/server";
import { formatNumber, formatPercent } from "@/lib/format/number";
import type { FoodHeader } from "@/services/catalog-service";

/**
 * The overall score: a big "৯২%", how many people it comes from, and a bar of loved vs the rest.
 * Floats over the bottom of the hero on phones; sits inside the hero on desktop. Below the minimum
 * number of experiences there is no score, only an invitation (decision P10).
 */
export function FoodStatsCard({ food, className }: { food: FoodHeader; className?: string }) {
  const t = getT();
  const hasScore = food.percent !== null && food.experienceCount > 0;
  const percent = food.percent ?? 0;
  return (
    <div
      className={`rounded-card-lg bg-card p-4 text-foreground shadow-floating lg:p-5 ${className ?? ""}`}
    >
      {hasScore ? (
        <>
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[40px] leading-none font-bold text-success-fg lg:text-[44px]">
              {formatPercent(percent)}
            </span>
            <span className="text-meta text-muted-foreground">
              {t("food.experienceCount", { count: formatNumber(food.experienceCount) })}
            </span>
          </div>
          <div aria-hidden className="mt-3 flex h-3.5 gap-[3px]">
            <span className="rounded-full bg-success" style={{ flex: Math.max(percent, 4) }} />
            <span className="rounded-full bg-muted" style={{ flex: Math.max(100 - percent, 4) }} />
          </div>
          <p className="mt-2.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-success-fg">
            <span aria-hidden>●</span>
            <span>{t("food.likedSuffix")}</span>
          </p>
        </>
      ) : (
        <p className="text-meta text-muted-foreground">{t("food.noExperiences")}</p>
      )}
    </div>
  );
}

/**
 * Phone only: three small cards under the hero (approved canvas: Food). The first is the people's
 * verdict once there is a score (decision P10), otherwise "new"; the second is how many people
 * ate it; the third is what adding an experience earns.
 */
export function FoodStatsStrip({ food, reward }: { food: FoodHeader; reward: string }) {
  const t = getT();
  const hasScore = food.percent !== null && food.experienceCount > 0;
  const cards = [
    {
      value: hasScore ? formatPercent(food.percent ?? 0) : t("food.stripNew"),
      label: hasScore ? t("food.likedSuffix") : t("food.stripNewHint"),
      tone: "text-cat-pink-fg",
    },
    {
      value: formatNumber(food.experienceCount),
      label: t("food.stripPeople"),
      tone: "text-primary-text",
    },
    { value: reward, label: t("food.stripXp"), tone: "text-cat-teal-fg" },
  ];
  return (
    <ul className="grid grid-cols-3 gap-2.5">
      {cards.map((card) => (
        <li
          key={card.label}
          className="rounded-[22px] bg-card px-2 py-3.5 text-center shadow-floating"
        >
          <div className={`font-display text-[22px] leading-tight font-extrabold ${card.tone}`}>
            {card.value}
          </div>
          <div className="text-[12.5px] leading-snug text-muted-foreground">{card.label}</div>
        </li>
      ))}
    </ul>
  );
}
