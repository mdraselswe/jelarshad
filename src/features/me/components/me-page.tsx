import Link from "next/link";
import { BookmarkIcon, StoreIcon, UtensilsIcon } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { ThemePreferenceControl } from "@/components/theme/theme-preference-control";
import { Button } from "@/components/ui/button";
import { LegalLinks } from "@/features/legal/components/legal-links";
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

/** The profile: who is signed in, three tabs (links, so they are shareable and need no JS), settings. */
export function MePage({ user, tab }: { user: AppUser; tab: MeTab }) {
  const t = getT();
  return (
    <PageShell>
      <HeroBand tone="home" className="flex items-center gap-3.5">
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-xl font-bold"
        >
          {[...user.displayName][0]}
        </span>
        <h1 className="text-title-1">{user.displayName}</h1>
      </HeroBand>

      <MePassport userId={user.id} />

      <nav aria-label={t("me.tabs.label")} className="mt-5 page-x">
        <div className="flex h-12 items-center gap-1 rounded-input bg-muted p-1">
          {ME_TABS.map((id) => (
            <Link
              key={id}
              href={id === "contrib" ? routes.me() : `${routes.me()}?tab=${id}`}
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
        <div className="flex flex-col gap-4 rounded-card-lg border border-border bg-card p-4">
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
      <LegalLinks />
    </PageShell>
  );
}
