import { CameraIcon, CheckIcon, MapPinIcon, StoreIcon, UtensilsIcon } from "lucide-react";

import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";
import type { MissionProgress } from "@/lib/gamification/missions";

import { XpBar } from "./game-bits";

const ICONS = {
  experience: UtensilsIcon,
  place: StoreIcon,
  district: MapPinIcon,
} as const;

type MissionMessageKey =
  | "game.mission.daily_experiences"
  | "game.mission.weekly_experiences"
  | "game.mission.weekly_districts"
  | "game.mission.weekly_places";

const MESSAGES: Record<string, MissionMessageKey> = {
  daily_experiences: "game.mission.daily_experiences",
  weekly_experiences: "game.mission.weekly_experiences",
  weekly_districts: "game.mission.weekly_districts",
  weekly_places: "game.mission.weekly_places",
};

/**
 * One goal with its bar. `onBand` draws it translucent on a dark or colored band; otherwise it is a
 * soft row for a white panel. Fixed height (64px) so lists of missions never reflow.
 */
export function MissionRow({
  mission,
  onBand = false,
}: {
  mission: MissionProgress;
  onBand?: boolean;
}) {
  const t = getT();
  const Icon = ICONS[mission.source] ?? CameraIcon;
  const key = MESSAGES[mission.id];
  return (
    <li
      className={cn(
        "flex h-16 items-center gap-3 rounded-[20px] px-3",
        onBand ? "bg-white/15" : "bg-primary-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-[14px]",
          mission.complete
            ? "bg-success text-primary-foreground"
            : onBand
              ? "bg-white/20 text-on-hero"
              : "bg-card text-primary-text",
        )}
      >
        {mission.complete ? <CheckIcon className="size-5" /> : <Icon className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-[14px] leading-tight font-semibold">
          {key ? t(key, { count: formatNumber(mission.target) }) : mission.id}
        </span>
        <XpBar
          fraction={mission.done / mission.target}
          className="mt-2 h-2"
          trackClassName={onBand ? "bg-white/25" : "bg-card"}
          fillClassName={onBand ? "bg-reward" : "bg-grad-reward"}
        />
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-[13px] font-bold">
          {mission.complete
            ? t("game.missionDone")
            : `${formatNumber(mission.done)}/${formatNumber(mission.target)}`}
        </span>
        <span
          className={cn(
            "mt-0.5 block rounded-full px-2 text-[12px] font-bold",
            onBand ? "bg-reward text-reward-foreground" : "bg-reward-soft text-reward-soft-fg",
          )}
        >
          {t("game.bonus", { count: formatNumber(mission.bonus) })}
        </span>
      </span>
    </li>
  );
}
