import { TrophyIcon } from "lucide-react";
import Link from "next/link";

import { IconChip } from "@/components/ui/icon-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import type { GameProgress } from "@/services/reward-service";

import { levelNameKey, LevelRing, StreakFlame, XpBar } from "./game-bits";

// One fixed height for the signed-in strip, the guest invitation and the skeleton, so the page does
// not move when the visitor's session arrives.
const STRIP =
  "relative z-10 mx-4 -mt-3 block h-[84px] rounded-[24px] bg-card shadow-floating md:mx-7 lg:mx-8 lg:mt-6";

export function LevelStripView({ progress }: { progress: GameProgress }) {
  const t = getT();
  const { level, streak } = progress;
  return (
    <Link
      href={routes.me()}
      className={`${STRIP} flex press animate-rise items-center gap-3.5 px-4`}
    >
      <LevelRing info={level} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2 text-[13px] font-semibold">
          <span className="truncate">
            {t(levelNameKey(level.level))}
            <span className="text-muted-foreground">
              {" · "}
              {t("game.levelLabel", { level: formatNumber(level.level) })}
            </span>
          </span>
          <span className="shrink-0 text-reward-soft-fg">
            {level.isMax
              ? t("game.xp", { count: formatNumber(level.xp) })
              : t("game.xpOf", {
                  done: formatNumber(level.xp),
                  total: formatNumber(level.ceiling ?? level.xp),
                })}
          </span>
        </span>
        <XpBar fraction={level.fraction} className="mt-2" />
      </span>
      <StreakFlame
        days={streak.current}
        label={t("game.streakDays", { count: formatNumber(streak.current) })}
        className="shrink-0 border-l border-divider pl-3"
      />
    </Link>
  );
}

export function LevelStripInvite() {
  const t = getT();
  return (
    <Link
      href={routes.login({ next: routes.me() })}
      className={`${STRIP} flex press animate-rise items-center gap-3.5 px-4`}
    >
      <IconChip tone="reward" size="md">
        <TrophyIcon />
      </IconChip>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-card-title">{t("game.startTitle")}</span>
        <span className="line-clamp-1 text-meta text-muted-foreground">{t("game.startBody")}</span>
      </span>
    </Link>
  );
}

export function LevelStripSkeleton() {
  return (
    <Skeleton className="relative z-10 mx-4 -mt-3 h-[84px] rounded-[24px] md:mx-7 lg:mx-8 lg:mt-6" />
  );
}

/** Signed-in visitor: level, XP and streak. Everyone else: an invitation of the same size. */
export async function HomeLevelStrip() {
  const session = await getServices().auth.getSession();
  if (!session) return <LevelStripInvite />;
  const progress = await getServices().rewards.progress(session.user.id);
  return <LevelStripView progress={progress} />;
}
