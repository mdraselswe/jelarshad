import { Section } from "@/components/layout/section";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";

import { PassportCard } from "./passport-card";
import { Stamp } from "./stamp";

async function districtNames(): Promise<Map<number, string>> {
  const options = await getServices().catalog.districtOptions();
  return new Map(options.map((option) => [option.id, option.nameBn]));
}

/** Home: the compact passport card for a signed-in visitor; nothing for everyone else. */
export async function HomePassport() {
  const session = await getServices().auth.getSession();
  if (!session) return null;
  const [summary, names] = await Promise.all([
    getServices().rewards.summary(session.user.id),
    districtNames(),
  ]);
  return (
    <section className="page-x pt-6 lg:max-w-xl lg:pt-10">
      <PassportCard summary={summary} districtNames={names} />
    </section>
  );
}

/** /me: points, progress per division and every stamp. */
export async function MePassport({ userId }: { userId: string }) {
  const t = getT();
  const [summary, names] = await Promise.all([
    getServices().rewards.summary(userId),
    districtNames(),
  ]);
  return (
    <>
      <section className="page-x pt-5 lg:max-w-xl">
        <PassportCard summary={summary} districtNames={names} />
      </section>

      <section className="mt-3 grid grid-cols-2 gap-2.5 page-x lg:max-w-xl">
        <div className="rounded-card border border-border bg-card p-3.5">
          <span className="block font-display text-[22px] leading-tight font-bold">
            {formatNumber(summary.points)}
          </span>
          <span className="text-caption text-muted-foreground">{t("reward.pointsLabel")}</span>
        </div>
        <div className="rounded-card border border-border bg-card p-3.5">
          <span className="block font-display text-[22px] leading-tight font-bold">
            {formatNumber(summary.unlockedCount)}
          </span>
          <span className="text-caption text-muted-foreground">
            {t("reward.ofDistricts", { count: formatNumber(summary.totalDistricts) })}
          </span>
        </div>
      </section>

      <Section title={t("reward.byDivision")}>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {summary.divisions.map((division) => (
            <div key={division.name} className="rounded-card border border-border bg-card p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-card-title">{division.name}</span>
                <span className="font-display text-sm text-muted-foreground">
                  {formatNumber(division.unlocked)}/{formatNumber(division.total)}
                </span>
              </div>
              <span className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="origin-left animate-progress rounded-full bg-reward"
                  style={{ width: `${Math.round((division.unlocked / division.total) * 100)}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t("reward.stampsTitle")}>
        {summary.stamps.length === 0 ? (
          <p className="text-meta text-muted-foreground">{t("reward.nothingYet")}</p>
        ) : (
          <div className="grid grid-cols-3 gap-y-2 rounded-card-lg border border-border bg-card p-3 lg:grid-cols-6">
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
    </>
  );
}
