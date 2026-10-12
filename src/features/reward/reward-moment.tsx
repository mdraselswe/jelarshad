"use client";

import { FlameIcon, MedalIcon, TrophyIcon, ZapIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        className="max-w-[calc(100%-2rem)] overflow-hidden border-0 bg-grad-hero p-0 text-on-hero sm:max-w-sm"
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
        <div className="relative flex flex-col items-center px-6 pt-10 pb-6 text-center">
          <span
            aria-hidden
            className="flex size-28 animate-fx-pop items-center justify-center rounded-[36px] bg-grad-reward text-on-reward shadow-toast"
          >
            <Icon className="size-14" />
          </span>
          <DialogDescription className="mt-5 text-[15px] font-semibold text-on-hero/90">
            {title}
          </DialogDescription>
          <DialogTitle className="mt-1 font-display text-[30px] leading-tight font-bold">
            {heading}
          </DialogTitle>
          {moment?.plain && (moment.level || moment.stamp) ? (
            <p className="mt-2 text-[14px] text-on-hero/85">{moment.plain}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {xp > 0 ? (
              <span className="flex h-10 items-center gap-1.5 rounded-full bg-white/20 px-4 font-display text-lg font-bold">
                <ZapIcon aria-hidden className="size-5 fill-reward stroke-reward" />
                {t("game.bonus", { count: formatNumber(xp) })}
              </span>
            ) : null}
            {moment?.level ? (
              <span className="flex h-10 items-center gap-1.5 rounded-full bg-white/20 px-4 font-display text-lg font-bold">
                <FlameIcon aria-hidden className="size-5 fill-reward stroke-reward" />
                {t("game.levelLabel", { level: formatNumber(moment.level) })}
              </span>
            ) : null}
          </div>
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <Link
              href={routes.me()}
              onClick={() => setMoment(null)}
              className="flex h-12 press items-center justify-center rounded-full bg-reward text-base font-bold text-reward-foreground"
            >
              {t("game.seePassport")}
            </Link>
            <button
              type="button"
              onClick={() => setMoment(null)}
              className="flex h-11 press items-center justify-center rounded-full bg-white/15 text-[15px] font-semibold"
            >
              {t("game.continue")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
