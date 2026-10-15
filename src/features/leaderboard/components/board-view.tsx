import Link from "next/link";

import { CrownArt } from "@/components/illustration/podium-art";
import { TrophyArt } from "@/components/illustration/podium-art";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";
import { toneClass } from "@/lib/tone";
import type { LeaderboardEntry } from "@/core/domain";

type Entry = LeaderboardEntry;

const initial = (name: string) => Array.from(name.trim())[0] ?? "?";

function Avatar({ name, seed, className }: { name: string; seed: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-display font-bold",
        toneClass(seed),
        className,
      )}
    >
      {initial(name)}
    </span>
  );
}

// Second, first, third from left to right; the pillars rise in that order.
const SLOTS = [
  { place: 2, height: "h-[92px]", delay: "150ms", avatar: "size-14 text-[24px]" },
  { place: 1, height: "h-[128px]", delay: "0ms", avatar: "size-[68px] text-[30px]" },
  { place: 3, height: "h-[72px]", delay: "300ms", avatar: "size-14 text-[24px]" },
] as const;

function Podium({ entries, userId }: { entries: Entry[]; userId: string | null }) {
  const t = getT();
  return (
    <ol
      aria-label={t("leaderboard.podiumLabel")}
      className="mx-auto grid max-w-md grid-cols-3 items-end gap-2.5 pt-7 lg:max-w-xl lg:gap-4"
    >
      {SLOTS.map((slot) => {
        const entry = entries[slot.place - 1];
        const mine = entry !== undefined && entry.userId === userId;
        const name = entry ? (mine ? t("leaderboard.you") : entry.displayName) : null;
        return (
          <li key={slot.place} className="flex min-w-0 flex-col items-center">
            <div className="relative">
              {slot.place === 1 && entry ? (
                <CrownArt className="absolute -top-6 left-1/2 w-9 -translate-x-1/2" />
              ) : null}
              {entry ? (
                <Avatar
                  name={entry.displayName}
                  seed={entry.userId}
                  className={cn(
                    slot.avatar,
                    "animate-fx-pop ring-4",
                    slot.place === 1 ? "ring-reward" : "ring-card",
                  )}
                />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground",
                    slot.avatar,
                  )}
                >
                  ?
                </span>
              )}
            </div>
            <p
              className={cn(
                "mt-2 w-full truncate text-center text-[14px] leading-tight font-semibold",
                !entry && "text-muted-foreground",
              )}
            >
              {name ?? "—"}
            </p>
            <p className="text-[12.5px] font-semibold text-reward-soft-fg">
              {entry ? t("game.xp", { count: formatNumber(entry.xp) }) : " "}
            </p>
            <div
              aria-hidden
              style={{ animationDelay: slot.delay }}
              className={cn(
                "mt-2 flex w-full origin-bottom animate-fx-grow items-start justify-center rounded-t-[22px] pt-2 font-display text-[28px] leading-none font-extrabold",
                slot.height,
                slot.place === 1
                  ? "bg-grad-reward text-on-reward shadow-card"
                  : slot.place === 2
                    ? "bg-muted text-foreground"
                    : "bg-primary-soft text-primary-soft-fg",
              )}
            >
              {formatNumber(slot.place)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The podium for the first three and a bar list for the rest; one board for one period. */
export function BoardView({ entries, userId }: { entries: Entry[]; userId: string | null }) {
  const t = getT();
  if (entries.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[28px] border border-border bg-card px-5 py-7 text-center shadow-card">
        <TrophyArt className="w-28" />
        <h2 className="mt-2 font-display text-[20px] leading-tight font-bold">
          {t("leaderboard.empty")}
        </h2>
        <p className="mt-1.5 text-meta text-muted-foreground">{t("leaderboard.emptyHint")}</p>
        <Link
          href={routes.add()}
          className="mt-4 flex h-11 press items-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground"
        >
          {t("leaderboard.cta")}
        </Link>
      </div>
    );
  }
  const rest = entries.slice(3);
  const top = entries[0]?.xp ?? 1;
  return (
    <div>
      <Podium entries={entries} userId={userId} />
      {rest.length > 0 ? (
        <section className="mx-auto mt-6 max-w-2xl">
          <h2 className="mb-3 px-1 text-heading">{t("leaderboard.listTitle")}</h2>
          <ol className="divide-y divide-divider overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
            {rest.map((entry, index) => {
              const mine = entry.userId === userId;
              const percent = Math.max(6, Math.round((entry.xp / top) * 100));
              return (
                <li
                  key={entry.userId}
                  className={cn("flex items-center gap-3 p-3.5", mine && "bg-primary-soft")}
                >
                  <span className="w-7 shrink-0 text-center font-display text-[17px] font-bold text-muted-foreground">
                    {formatNumber(index + 4)}
                  </span>
                  <Avatar
                    name={entry.displayName}
                    seed={entry.userId}
                    className="size-11 text-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-card-title">
                        {mine ? t("leaderboard.you") : entry.displayName}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-reward-soft-fg">
                        {t("game.xp", { count: formatNumber(entry.xp) })}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="mt-1.5 block h-2 overflow-hidden rounded-full bg-muted"
                    >
                      <span
                        className="block h-full origin-left animate-fx-fill rounded-full bg-grad-reward"
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
