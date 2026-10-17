import { CompassIcon, FlameIcon, MapPinIcon, StoreIcon, UtensilsIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { routes } from "@/config/routes";
import { LevelRing, levelNameKey } from "@/features/game/components/game-bits";
import { getT } from "@/i18n/server";
import type { MessageKey } from "@/i18n/t";
import { formatNumber } from "@/lib/format/number";
import type { PublicProfile } from "@/services/reward-service";

const STATS: { id: keyof PublicProfile["counts"]; icon: LucideIcon; tile: string }[] = [
  { id: "districts", icon: MapPinIcon, tile: "bg-tile-1" },
  { id: "experiences", icon: UtensilsIcon, tile: "bg-tile-2" },
  { id: "places", icon: StoreIcon, tile: "bg-tile-3" },
  { id: "discoveries", icon: CompassIcon, tile: "bg-tile-5" },
];

/** Badge names live under game.badge.<id>; the ids come from the badge config, not from a person. */
const badgeName = (id: string) => `game.badge.${id}` as MessageKey;

/** A person who chose to be listed: photo, name, level, what they have done and what they earned. */
export function PersonPage({ id, profile }: { id: string; profile: PublicProfile }) {
  const t = getT();
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.leaderboard()}
          crumbs={[
            { label: t("leaderboard.navTitle"), href: routes.leaderboard() },
            { label: profile.displayName },
          ]}
        />
      }
    >
      <HeroBand
        tone="home"
        bleed
        scene={
          <div className="hidden lg:block">
            <WorldStrip scene="village" />
          </div>
        }
        className="pb-12 lg:pb-[150px]"
        bar={<HeroBar backHref={routes.leaderboard()} />}
      >
        <div className="flex items-center gap-4">
          <UserAvatar
            name={profile.displayName}
            src={profile.avatarUrl}
            seed={id}
            className="size-20 text-[34px] ring-4 ring-white/40 lg:size-24"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[28px] leading-[1.2] font-bold break-words lg:text-[40px]">
              {profile.displayName}
            </h1>
            <p className="mt-1 text-[14px] text-on-hero/90">
              {t(levelNameKey(profile.level.level))} ·{" "}
              {t("person.xp", { count: formatNumber(profile.xp) })}
            </p>
          </div>
          <LevelRing
            info={profile.level}
            onDark
            caption={t("person.levelWord")}
            className="shrink-0"
          />
        </div>
        {profile.bestStreak > 0 ? (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold">
            <FlameIcon className="size-4" aria-hidden />
            {t("person.streakBest", { count: formatNumber(profile.bestStreak) })}
          </p>
        ) : null}
      </HeroBand>

      <section className="page-x pt-5 lg:pt-8">
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map(({ id: stat, icon: Icon, tile }) => (
            <li
              key={stat}
              className="flex items-center gap-3 rounded-[22px] border border-border bg-card p-3.5 shadow-card"
            >
              <span
                aria-hidden
                className={`flex size-11 shrink-0 items-center justify-center rounded-[16px] text-on-hero ${tile}`}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[22px] leading-tight font-bold">
                  {formatNumber(profile.counts[stat])}
                </span>
                <span className="block text-meta text-muted-foreground">
                  {t(`person.stats.${stat}`)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Section title={t("person.badges")} tone="amber">
        {profile.badges.length === 0 ? (
          <p className="text-meta text-muted-foreground">{t("person.noBadges")}</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {profile.badges.map((badge) => (
              <li
                key={badge.id}
                className="rounded-full bg-reward-soft px-3.5 py-2 text-[14px] font-semibold text-reward-soft-fg"
              >
                {t(badgeName(badge.id))}
              </li>
            ))}
          </ul>
        )}
      </Section>
      <p className="page-x pt-4 text-center text-meta text-muted-foreground">{t("person.note")}</p>
    </PageShell>
  );
}

export function PersonPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.leaderboard()} />}>
        <HeroBand
          tone="home"
          bleed
          scene={
            <div className="hidden lg:block">
              <WorldStrip scene="village" />
            </div>
          }
          className="pb-12 lg:pb-[150px]"
          bar={<HeroBar backHref={routes.leaderboard()} />}
        >
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 shrink-0 rounded-full bg-white/20 lg:size-24" />
            <div className="min-w-0 flex-1">
              <div className="font-display text-[28px] leading-[1.2] lg:text-[40px]">
                <SkeletonText className="w-2/3" />
              </div>
              <div className="mt-1 text-[14px]">
                <SkeletonText className="w-1/2" />
              </div>
            </div>
            <Skeleton className="size-[54px] shrink-0 rounded-full bg-white/20" />
          </div>
        </HeroBand>
        <section className="page-x pt-5 lg:pt-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-[74px] rounded-[22px]" />
            ))}
          </div>
        </section>
        <Section title={<SkeletonText className="w-28" />} tone="amber">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </Section>
      </PageShell>
    </LoadingRegion>
  );
}
