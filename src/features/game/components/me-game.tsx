import {
  CompassIcon,
  FlameIcon,
  LockIcon,
  MapPinIcon,
  MedalIcon,
  StoreIcon,
  TargetIcon,
  TrophyIcon,
  UtensilsIcon,
  type LucideIcon,
} from "lucide-react";

import { PinArt, RouteArt } from "@/components/illustration/food-art";
import { Band } from "@/components/layout/band";
import { Panel } from "@/components/layout/panel";
import type { BadgeMetric, BadgeStatus } from "@/lib/gamification/badges";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";
import type { PassportSummary } from "@/services/reward-service";

import { LeaderboardToggle } from "./leaderboard-toggle";
import { MissionRow } from "./mission-row";

const BADGE_ICON: Record<BadgeMetric, LucideIcon> = {
  districts: MedalIcon,
  bestStreak: FlameIcon,
  experiences: UtensilsIcon,
  places: StoreIcon,
  discoveries: CompassIcon,
};

const BADGE_TILE: Record<BadgeMetric, string> = {
  districts: "bg-tile-1",
  bestStreak: "bg-tile-4",
  experiences: "bg-tile-2",
  places: "bg-tile-3",
  discoveries: "bg-tile-5",
};

type BadgeNameKey =
  | "game.badge.first_stamp"
  | "game.badge.districts_5"
  | "game.badge.districts_10"
  | "game.badge.districts_25"
  | "game.badge.streak_3"
  | "game.badge.streak_7"
  | "game.badge.streak_30"
  | "game.badge.experiences_10"
  | "game.badge.experiences_50"
  | "game.badge.places_1"
  | "game.badge.places_5"
  | "game.badge.discoverer_1";

function BadgeTile({ badge, name }: { badge: BadgeStatus; name: string }) {
  const t = getT();
  const Icon = BADGE_ICON[badge.metric];
  return (
    <li className="flex flex-col items-center gap-2 rounded-[22px] bg-primary-soft/50 px-2 py-3.5 text-center">
      <span
        aria-hidden
        className={cn(
          "flex size-[60px] items-center justify-center rounded-[20px]",
          badge.earned
            ? cn(BADGE_TILE[badge.metric], "animate-fx-pop text-on-hero")
            : "bg-muted text-muted-foreground",
        )}
      >
        {badge.earned ? <Icon className="size-7" /> : <LockIcon className="size-6" />}
      </span>
      <span
        className={cn(
          "text-[13px] leading-tight font-semibold",
          !badge.earned && "text-muted-foreground",
        )}
      >
        {name}
      </span>
      <span className="text-[12px] text-muted-foreground">
        {badge.earned
          ? t("game.badgeEarned")
          : t("game.badgeLocked", {
              value: formatNumber(badge.value),
              target: formatNumber(badge.target),
            })}
      </span>
    </li>
  );
}

/**
 * The game layer of /me (docs/00-decisions.md P15): the journey through the districts, this week's
 * missions, badges and the opt-in weekly board.
 */
export async function MeGame({ userId, summary }: { userId: string; summary: PassportSummary }) {
  const t = getT();
  const services = getServices();
  const [progress, board, options] = await Promise.all([
    services.rewards.progress(userId),
    services.rewards.leaderboard(userId),
    services.catalog.districtOptions(),
  ]);
  const names = new Map(options.map((option) => [option.id, option.nameBn]));
  const visited = summary.stamps
    .filter((stamp) => stamp.kind === "visit")
    .slice(-5)
    .reverse();
  const more = Math.max(0, summary.unlockedCount - visited.length);
  const earned = progress.badges.filter((badge) => badge.earned).length;
  const orderedBadges = [...progress.badges].sort(
    (a, b) => Number(b.earned) - Number(a.earned) || b.value / b.target - a.value / a.target,
  );
  const topBadges = orderedBadges.slice(0, 6);
  const otherBadges = orderedBadges.slice(6);
  const day = progress.missions.filter((mission) => mission.period === "day");
  const week = progress.missions.filter((mission) => mission.period === "week");

  return (
    <>
      <section aria-label={t("game.streakLabel")} className="page-x pt-5">
        <dl className="grid grid-cols-3 gap-2.5">
          <div className="rounded-[22px] bg-card p-3.5 text-center shadow-card">
            <dd className="font-display text-2xl font-bold text-primary-text">
              {formatNumber(progress.counts.districts)}
            </dd>
            <dt className="text-caption text-muted-foreground">{t("me.stats.districts")}</dt>
          </div>
          <div className="rounded-[22px] bg-card p-3.5 text-center shadow-card">
            <dd className="font-display text-2xl font-bold text-cat-pink-fg">
              {formatNumber(progress.counts.experiences)}
            </dd>
            <dt className="text-caption text-muted-foreground">{t("me.stats.experiences")}</dt>
          </div>
          <div className="rounded-[22px] bg-card p-3.5 text-center shadow-card">
            <dd className="font-display text-2xl font-bold text-cat-teal-fg">
              {formatNumber(earned)}
            </dd>
            <dt className="text-caption text-muted-foreground">{t("me.stats.badges")}</dt>
          </div>
        </dl>
        {progress.streak.best > 0 ? (
          <p className="mt-2.5 text-center text-meta text-muted-foreground">
            {t("game.streakBest", { count: formatNumber(progress.streak.best) })}
          </p>
        ) : null}
      </section>

      <Panel
        title={t("game.journeyTitle")}
        icon={<MapPinIcon />}
        tone="violet"
        action={
          <span className="text-sm font-semibold text-primary-text">
            {t("game.journeyCount", {
              done: formatNumber(summary.unlockedCount),
              total: formatNumber(summary.totalDistricts),
            })}
          </span>
        }
      >
        <div className="relative h-[84px]">
          <RouteArt tone="gold" className="absolute inset-0 h-full w-full" />
          <PinArt className="absolute top-[34px] left-[2%] w-6" />
          <PinArt tone="b" delay={700} className="absolute top-[8px] left-[34%] w-6" />
          <PinArt tone="c" delay={1400} className="absolute top-[30px] left-[62%] w-6" />
          <PinArt delay={2100} className="absolute top-[0px] left-[92%] w-6 opacity-50" />
        </div>
        <span aria-hidden className="mt-1 flex h-2.5 overflow-hidden rounded-full bg-muted">
          <span
            className="origin-left animate-progress rounded-full bg-grad-action"
            style={{
              width: `${Math.round((summary.unlockedCount / summary.totalDistricts) * 100)}%`,
            }}
          />
        </span>
        {visited.length > 0 ? (
          <ul className="mt-3.5 flex flex-wrap gap-2">
            {visited.map((stamp, index) => (
              <li
                key={stamp.districtId}
                className={cn(
                  "rounded-[14px] px-3 py-1.5 text-[13px] font-semibold",
                  index % 3 === 0 && "bg-cat-violet-soft text-cat-violet-fg",
                  index % 3 === 1 && "bg-cat-pink-soft text-cat-pink-fg",
                  index % 3 === 2 && "bg-cat-teal-soft text-cat-teal-fg",
                )}
              >
                {names.get(stamp.districtId) ?? ""}
              </li>
            ))}
            {more > 0 ? (
              <li className="rounded-[14px] bg-muted px-3 py-1.5 text-[13px] font-semibold text-muted-foreground">
                +{formatNumber(more)}
              </li>
            ) : null}
          </ul>
        ) : null}
      </Panel>

      <Band tone="teal" title={t("game.missionsWeek")} icon={<TargetIcon />}>
        <ul className="flex flex-col gap-2">
          {[...day, ...week].map((mission) => (
            <MissionRow key={mission.id} mission={mission} onBand />
          ))}
        </ul>
      </Band>

      <Panel title={t("game.badgesTitle")} icon={<MedalIcon />} tone="amber" className="-mt-2">
        <ul className="grid grid-cols-3 gap-2.5 lg:grid-cols-6">
          {topBadges.map((badge) => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              name={t(`game.badge.${badge.id}` as BadgeNameKey)}
            />
          ))}
        </ul>
        {otherBadges.length > 0 ? (
          <details className="group mt-3">
            <summary className="flex h-11 cursor-pointer list-none items-center justify-center rounded-[16px] bg-primary-soft text-[14px] font-semibold text-primary-soft-fg [&::-webkit-details-marker]:hidden">
              {t("game.allBadges", { count: formatNumber(progress.badges.length) })}
            </summary>
            <ul className="mt-3 grid grid-cols-3 gap-2.5 lg:grid-cols-6">
              {otherBadges.map((badge) => (
                <BadgeTile
                  key={badge.id}
                  badge={badge}
                  name={t(`game.badge.${badge.id}` as BadgeNameKey)}
                />
              ))}
            </ul>
          </details>
        ) : null}
      </Panel>

      <Band tone="warm" title={t("game.boardTitle")} icon={<TrophyIcon />}>
        <p className="-mt-1 mb-3 text-meta text-muted-foreground">{t("game.boardHint")}</p>
        {board.entries.length === 0 ? (
          <p className="rounded-[20px] bg-card p-4 text-meta text-muted-foreground">
            {t("game.boardEmpty")}
          </p>
        ) : (
          <ol className="divide-y divide-divider rounded-[22px] bg-card px-4 shadow-card">
            {board.entries.map((entry, index) => (
              <li key={entry.userId} className="flex items-center gap-3 py-3">
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-[12px] font-display font-bold",
                    index === 0 && "bg-grad-reward text-on-reward",
                    index === 1 && "bg-muted text-foreground",
                    index > 1 && "bg-primary-soft text-primary-soft-fg",
                  )}
                >
                  {formatNumber(index + 1)}
                </span>
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {entry.userId === userId ? t("game.boardYou") : entry.displayName}
                </span>
                <span className="text-sm font-semibold text-reward-soft-fg">
                  {t("game.xp", { count: formatNumber(entry.xp) })}
                </span>
              </li>
            ))}
          </ol>
        )}
        <div className="mt-3">
          <LeaderboardToggle initial={board.optedIn ?? false} />
        </div>
      </Band>
    </>
  );
}
