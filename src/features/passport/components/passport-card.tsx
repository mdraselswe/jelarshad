import { LockIcon } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import type { PassportSummary } from "@/services/reward-service";

import { PassportRing } from "./passport-ring";
import { Stamp } from "./stamp";

/**
 * The passport on the home page: ring, the latest stamps, and the next one to go for
 * (a famous food in a district that has not been tried yet).
 */
export function PassportCard({
  summary,
  districtNames,
}: {
  summary: PassportSummary;
  districtNames: Map<number, string>;
}) {
  const t = getT();
  const recent = summary.stamps.filter((stamp) => stamp.kind === "visit").slice(-3);
  return (
    <div className="rounded-card-lg bg-grad-reward p-4 text-on-reward shadow-card">
      <Link href={routes.me()} className="flex items-center gap-3.5">
        <PassportRing value={summary.unlockedCount} total={summary.totalDistricts} onReward />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold">{t("reward.passportTitle")}</span>
          <span className="block text-meta opacity-85">
            {summary.unlockedCount > 0
              ? t("reward.passportHint", { count: formatNumber(summary.unlockedCount) })
              : t("reward.nothingYet")}
          </span>
        </span>
        <span className="flex shrink-0 -space-x-3">
          {recent.map((stamp) => (
            <Stamp
              key={stamp.districtId}
              districtId={stamp.districtId}
              name={districtNames.get(stamp.districtId) ?? ""}
              date={stamp.createdAt}
              size={40}
            />
          ))}
        </span>
      </Link>
      {summary.next && (
        <div className="mt-3.5 flex items-center gap-3 border-t border-on-reward/20 pt-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-on-reward/40">
            <LockIcon className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-meta leading-snug">
            <span className="block opacity-85">{t("reward.next")}</span>
            <b>{summary.next.district.nameBn}</b>:{" "}
            {t("reward.nextCta", { food: summary.next.food.nameBn })}
          </span>
          <Link
            href={routes.districtFood(summary.next.district.slug, summary.next.food.slug)}
            className="flex h-9 shrink-0 press items-center rounded-full bg-on-reward px-3.5 text-sm font-semibold text-reward-soft"
          >
            {t("reward.where")}
          </Link>
        </div>
      )}
    </div>
  );
}
