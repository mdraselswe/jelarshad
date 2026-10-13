import Link from "next/link";
import { BookmarkIcon, FlameIcon, StoreIcon, UtensilsIcon } from "lucide-react";

import { TrophyArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { ThemePreferenceControl } from "@/components/theme/theme-preference-control";
import { Button } from "@/components/ui/button";
import { MeGame } from "@/features/game/components/me-game";
import { levelNameKey, LevelRing } from "@/features/game/components/game-bits";
import { MePassport } from "@/features/passport/components/passport-section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import type { AppUser } from "@/core/domain";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format/date";
import { KIND_TONE_CLASS } from "@/lib/tone";
import { formatNumber } from "@/lib/format/number";

export const ME_TABS = ["contrib", "ate", "saved"] as const;
export type MeTab = (typeof ME_TABS)[number];

export function parseMeTab(value: string | string[] | undefined): MeTab {
  const first = Array.isArray(value) ? value[0] : value;
  return ME_TABS.find((tab) => tab === first) ?? "contrib";
}

const REACTION_EMOJI = { loved: "😍", okay: "🙂", disliked: "😕" } as const;

async function Contributions({ userId }: { userId: string }) {
  const t = getT();
  const { places, experienceCount } = await getServices().me.contributions(userId);
  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          [formatNumber(experienceCount), t("me.stats.experiences"), KIND_TONE_CLASS.food],
          [formatNumber(places.length), t("me.stats.places"), KIND_TONE_CLASS.place],
        ].map(([value, label, tone]) => (
          <div key={label} className={cn("rounded-card-lg p-4", tone)}>
            <span className="block font-display text-[26px] leading-tight font-bold">{value}</span>
            <span className="text-caption">{label}</span>
          </div>
        ))}
      </div>
      <h3 className="mt-5 mb-2 text-card-title">{t("me.placesAdded")}</h3>
      {places.length === 0 ? (
        <EmptyState
          message={t("me.emptyContrib")}
          action={{ label: t("me.addPlace"), href: routes.add() }}
        />
      ) : (
        <GroupedList split>
          {places.map((place) => (
            <ListRow
              key={place.slug}
              href={routes.place(place.slug)}
              leading={
                <ListTile tone="place">
                  <StoreIcon />
                </ListTile>
              }
              title={place.nameBn}
              meta={place.districtNameBn}
            />
          ))}
        </GroupedList>
      )}
    </>
  );
}

async function Ate({ userId }: { userId: string }) {
  const t = getT();
  const rows = await getServices().me.ate(userId);
  if (rows.length === 0) return <EmptyState message={t("me.emptyAte")} />;
  return (
    <GroupedList split>
      {rows.map((row) => (
        <ListRow
          key={row.experienceId}
          href={routes.food(row.food.slug)}
          leading={
            <ListTile tone="info">
              <span aria-hidden className="text-xl">
                {REACTION_EMOJI[row.reaction]}
              </span>
            </ListTile>
          }
          title={row.food.nameBn}
          meta={[
            row.place.nameBn,
            row.place.districtNameBn,
            timeAgo(row.createdAt),
            t(`reaction.${row.reaction}`),
          ].join(" · ")}
        />
      ))}
    </GroupedList>
  );
}

async function Saved({ userId }: { userId: string }) {
  const t = getT();
  const rows = await getServices().me.saved(userId);
  if (rows.length === 0) return <EmptyState message={t("me.emptySaved")} />;
  return (
    <GroupedList split>
      {rows.map((row) => (
        <ListRow
          key={`${row.kind}:${row.slug}`}
          href={row.kind === "food" ? routes.food(row.slug) : routes.place(row.slug)}
          leading={
            <ListTile tone={row.kind === "food" ? "food" : "place"}>
              {row.kind === "food" ? <UtensilsIcon /> : <BookmarkIcon />}
            </ListTile>
          }
          title={row.nameBn}
          meta={row.meta ?? " "}
        />
      ))}
    </GroupedList>
  );
}

/**
 * The passport (docs/design/ Passport): a hero with the level ring and XP, the stamp journey, missions,
 * badges and this week's board. Contributions and settings live on the profile page.
 */
export async function MePage({ user }: { user: AppUser }) {
  const t = getT();
  const [summary, progress] = await Promise.all([
    getServices().rewards.summary(user.id),
    getServices().rewards.progress(user.id),
  ]);
  return (
    <PageShell header={null}>
      <HeroBand
        tone="home"
        bleed
        scene={<WorldStrip scene="river" />}
        className="pb-[132px] lg:pb-12"
      >
        <TrophyArt className="pointer-events-none absolute top-6 -right-2 hidden w-40 opacity-25 lg:block" />
        <div className="relative flex items-start justify-between gap-3">
          <h1 className="font-display text-[22px] leading-tight font-extrabold lg:text-[30px]">
            {t("me.passportTitle")}
          </h1>
          <span className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 text-[13px] font-semibold">
            <FlameIcon
              className={cn(
                "size-4",
                progress.streak.current > 0 && "animate-fx-flame fill-reward stroke-reward",
              )}
              aria-hidden
            />
            {t("game.streakChip", { count: formatNumber(progress.streak.current) })}
          </span>
        </div>
        <div className="relative mt-3 flex flex-col items-center text-center">
          <LevelRing
            info={progress.level}
            size={130}
            stroke={12}
            onDark
            caption={t("game.levelWord")}
          />
          <p className="mt-3 font-display text-[22px] leading-tight font-extrabold">
            {t(levelNameKey(progress.level.level))}
          </p>
          <p className="mt-1 text-[13.5px] text-on-hero/90">
            {progress.level.isMax
              ? t("game.maxLevel")
              : t("game.toNext", { count: formatNumber(progress.level.toNext) })}
          </p>
          <span className="mt-3 flex h-8 items-center rounded-full bg-reward px-3.5 text-[14px] font-bold text-reward-foreground">
            {t("reward.pointsChip", { count: formatNumber(summary.points) })}
          </span>
        </div>
      </HeroBand>

      <MeGame userId={user.id} summary={summary} />
      <MePassport summary={summary} />
    </PageShell>
  );
}

/** "Me": what I added and ate, what I saved, and the settings. */
export async function MeProfilePage({ user, tab }: { user: AppUser; tab: MeTab }) {
  const t = getT();
  const summary = await getServices().rewards.summary(user.id);
  return (
    <PageShell>
      <section className="page-x pt-3 lg:pt-8">
        <div className="flex items-center gap-4 rounded-[28px] border border-border bg-card p-4 shadow-card">
          <span
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-[22px] bg-tile-1 font-display text-[28px] font-extrabold text-on-hero"
          >
            {[...user.displayName][0]}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-title-1 break-words">{user.displayName}</h1>
            <span className="mt-1.5 inline-flex h-8 items-center rounded-full bg-reward-soft px-3 text-[14px] font-bold text-reward-soft-fg">
              {t("reward.pointsChip", { count: formatNumber(summary.points) })}
            </span>
          </div>
          <Link
            href={routes.me()}
            className="flex h-11 shrink-0 press items-center rounded-full bg-primary-soft px-4 text-[14px] font-semibold text-primary-soft-fg"
          >
            {t("nav.passport")}
          </Link>
        </div>
      </section>

      <nav aria-label={t("me.tabs.label")} className="mt-5 page-x">
        <div className="flex h-12 items-center gap-1 rounded-input bg-muted p-1">
          {ME_TABS.map((id) => (
            <Link
              key={id}
              href={id === "contrib" ? routes.profile() : `${routes.profile()}?tab=${id}`}
              aria-current={id === tab ? "page" : undefined}
              className={cn(
                "flex h-full flex-1 items-center justify-center rounded-xl px-2 text-[15px] font-medium whitespace-nowrap text-muted-foreground",
                id === tab && "bg-card font-semibold text-primary-text shadow-segment",
              )}
            >
              {t(`me.tabs.${id}`)}
            </Link>
          ))}
        </div>
      </nav>

      <section className="mt-4 page-x">
        {tab === "contrib" && <Contributions userId={user.id} />}
        {tab === "ate" && <Ate userId={user.id} />}
        {tab === "saved" && <Saved userId={user.id} />}
      </section>

      <Section title={t("me.settings")}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-card-title">{t("me.theme")}</p>
            <ThemePreferenceControl />
          </div>
          <form action={routes.signOut()} method="post">
            <Button type="submit" variant="outline">
              {t("auth.signOut")}
            </Button>
          </form>
        </div>
      </Section>
    </PageShell>
  );
}
