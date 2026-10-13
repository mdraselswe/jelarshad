"use client";

import { FlameIcon, MedalIcon, TrophyIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PersonArt } from "@/components/illustration/world-art";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { routes } from "@/config/routes";
import { levelNameKey } from "@/features/game/components/game-bits";
import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format/number";
import { subscribeMoment, type Moment } from "@/lib/reward-moment";

const CONFETTI = [
  { left: "6%", color: "bg-reward", delay: "0s" },
  { left: "20%", color: "bg-cat-pink-fg", delay: "-1.1s" },
  { left: "34%", color: "bg-success", delay: "-2.2s" },
  { left: "48%", color: "bg-primary", delay: "-0.6s" },
  { left: "62%", color: "bg-reward", delay: "-1.7s" },
  { left: "76%", color: "bg-cat-pink-fg", delay: "-2.5s" },
  { left: "90%", color: "bg-cat-sky-fg", delay: "-0.3s" },
] as const;

/**
 * The full-screen celebration for a new stamp or a new level: confetti, a medal or trophy, the XP
 * earned and where to see it. Mounted once in the root layout (after hydration).
 */
export function RewardMoment() {
  const t = useT();
  const [moment, setMoment] = useState<Moment | null>(null);

  useEffect(() => subscribeMoment(setMoment), []);

  const open = moment !== null;
  const xp = moment ? moment.points + moment.bonus : 0;
  const title = moment?.level
    ? t("game.levelUpTitle")
    : moment?.stamp
      ? t("game.stampTitle")
      : (moment?.plain ?? "");
  const heading = moment?.level
    ? t("game.levelUpBody", { name: t(levelNameKey(moment.level)) })
    : (moment?.stamp?.districtName ?? "");
  const Icon = moment?.level ? TrophyIcon : MedalIcon;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setMoment(null)}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-dvh max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-grad-hero p-0 text-on-hero sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[32px]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONFETTI.map((piece) => (
            <span
              key={piece.left}
              className={`absolute top-0 h-4 w-2.5 animate-fx-fall rounded-[3px] ${piece.color}`}
              style={{ left: piece.left, animationDelay: piece.delay }}
            />
          ))}
        </div>
        <div className="relative flex h-full min-h-dvh flex-col items-center px-6 pt-[18dvh] pb-8 text-center sm:min-h-0 sm:pt-10 sm:pb-6">
          <div className="relative flex size-[200px] items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-4 animate-fx-twinkle rounded-full bg-reward/60 blur-2xl"
            />
            <span
              aria-hidden
              className="relative flex size-[138px] -rotate-6 animate-fx-pop items-center justify-center rounded-[44px] bg-grad-reward text-on-reward shadow-toast"
            >
              <Icon className="size-[74px]" strokeWidth={1.8} />
            </span>
          </div>
          <DialogDescription className="mt-5 text-[15px] font-semibold text-on-hero/90">
            {title}
          </DialogDescription>
          <DialogTitle className="mt-1 font-display text-[36px] leading-[1.2] font-extrabold">
            {heading}
          </DialogTitle>
          {moment?.plain && (moment.level || moment.stamp) ? (
            <p className="mt-2 text-[14px] text-on-hero/85">{moment.plain}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {xp > 0 ? (
              <span className="flex h-11 items-center gap-2 rounded-[18px] bg-white/16 px-4 font-display text-xl font-extrabold">
                <ZapIcon aria-hidden className="size-5 fill-reward stroke-reward" />
                {t("game.bonus", { count: formatNumber(xp) })}
              </span>
            ) : null}
            {moment?.level ? (
              <span className="flex h-11 items-center gap-2 rounded-[18px] bg-white/16 px-4 font-display text-xl font-extrabold">
                <FlameIcon aria-hidden className="size-5 fill-reward stroke-reward" />
                {t("game.levelLabel", { level: formatNumber(moment.level) })}
              </span>
            ) : null}
          </div>
          <div aria-hidden className="mt-auto flex items-end justify-center gap-4 pt-6">
            <PersonArt shirt="b" walking={false} className="h-16 w-8 animate-fx-float" />
            <PersonArt shirt="a" walking={false} className="h-[72px] w-9 animate-fx-float-b" />
            <PersonArt shirt="c" walking={false} className="h-16 w-8 animate-fx-float-c" />
          </div>
          <div className="flex w-full flex-col gap-2.5 pt-5">
            <Link
              href={routes.me()}
              onClick={() => setMoment(null)}
              className="flex h-[54px] press items-center justify-center rounded-[18px] bg-grad-reward text-base font-bold text-on-reward"
            >
              {t("game.seePassport")}
            </Link>
            <button
              type="button"
              onClick={() => setMoment(null)}
              className="flex h-12 press items-center justify-center rounded-[18px] bg-white/15 text-[15px] font-semibold"
            >
              {t("game.continue")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
