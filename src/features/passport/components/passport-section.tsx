import { LockIcon } from "lucide-react";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { routes } from "@/config/routes";
import type { PassportSummary } from "@/services/reward-service";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";

import { getHomeData } from "@/features/home/queries";

import { PassportCard } from "./passport-card";
import { PassportInvite } from "./passport-invite";
import { Stamp } from "./stamp";

async function districtNames(): Promise<Map<number, string>> {
  const options = await getServices().catalog.districtOptions();
  return new Map(options.map((option) => [option.id, option.nameBn]));
}

/** Same box as the card, so the page does not jump when the visitor's passport arrives. */
export function HomePassportSkeleton() {
  return <div aria-hidden className="h-[172px] rounded-card-lg bg-skeleton" />;
}

/**
 * Home: the passport card for a signed-in visitor, an invitation to start one for everyone else
 * (docs/design: gold card). Rendered twice on the home page: inside the desktop hero and below the kinds card on phones.
 */
export async function HomePassport() {
  const session = await getServices().auth.getSession();
  if (!session) {
    const { divisions } = await getHomeData();
    const total = divisions.reduce((sum, division) => sum + division.districts.length, 0);
    return <PassportInvite total={total} />;
  }
  const [summary, names] = await Promise.all([
    getServices().rewards.summary(session.user.id),
    districtNames(),
  ]);
  return <PassportCard summary={summary} districtNames={names} />;
}

/** /me: progress per division, the next stamp to go for, and every stamp. */
export async function MePassport({ summary }: { summary: PassportSummary }) {
  const t = getT();
  const names = await districtNames();
  return (
    <>
      {summary.next ? (
        <section className="page-x pt-5 lg:max-w-xl">
          <Link
            href={routes.districtFood(summary.next.district.slug, summary.next.food.slug)}
            className="flex press items-center gap-3.5 rounded-card-lg border-2 border-dashed border-border bg-card p-4"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground">
              <LockIcon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-caption text-muted-foreground">{t("reward.next")}</span>
              <span className="block text-card-title">
                {summary.next.district.nameBn}:{" "}
                {t("reward.nextCta", { food: summary.next.food.nameBn })}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-primary-text">
              {t("reward.where")}
            </span>
          </Link>
        </section>
      ) : null}

      <Section title={t("reward.stampsTitle")}>
        {summary.stamps.length === 0 ? (
          <p className="text-meta text-muted-foreground">{t("reward.nothingYet")}</p>
        ) : (
          <div className="grid rise-children grid-cols-3 gap-y-4 rounded-card-lg border border-border bg-card p-4 shadow-card lg:grid-cols-6">
            {summary.stamps.map((stamp) => (
              <div key={`${stamp.districtId}-${stamp.kind}`} className="flex justify-center">
                <Stamp
                  districtId={stamp.districtId}
                  name={names.get(stamp.districtId) ?? ""}
                  date={stamp.createdAt}
                  kind={stamp.kind}
                />
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={t("reward.byDivision")}>
        <div className="grid rise-children grid-cols-1 gap-x-8 rounded-card-lg border border-border bg-card px-4 py-1 shadow-card lg:grid-cols-2">
          {summary.divisions.map((division) => (
            <div
              key={division.name}
              className="flex items-center gap-3.5 border-b border-divider py-3.5 last:border-b-0 lg:[&:nth-last-child(2)]:border-b-0"
            >
              <span className="w-20 shrink-0 text-card-title">{division.name}</span>
              <span className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="origin-left animate-progress rounded-full bg-grad-reward"
                  style={{ width: `${Math.round((division.unlocked / division.total) * 100)}%` }}
                />
              </span>
              <span className="w-12 shrink-0 text-right font-display text-sm font-bold text-reward-soft-fg">
                {formatNumber(division.unlocked)}/{formatNumber(division.total)}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
