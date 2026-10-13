import { TargetIcon } from "lucide-react";
import Link from "next/link";

import { RouteArt } from "@/components/illustration/food-art";
import { Band } from "@/components/layout/band";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";

import { XpBar } from "./game-bits";
import { missionTitle } from "./mission-row";

// The band's body has one height on every path (mission, invitation, skeleton): label, a two-line
// title, the dotted route and the progress row (approved canvas: Main, section 2).
const BODY = "relative h-[150px]";

function MissionsShell({ children }: { children: React.ReactNode }) {
  const t = getT();
  return (
    <Band tone="teal" className="relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-2 -right-8 size-[150px] rounded-full bg-white/10"
      />
      <div className={BODY}>
        <h2 className="relative flex items-center gap-2 text-[13px] font-semibold">
          <TargetIcon className="size-[18px] text-reward-soft" aria-hidden />
          {t("game.missionsToday")}
        </h2>
        {children}
      </div>
    </Band>
  );
}

export function HomeMissionsSkeleton() {
  return (
    <MissionsShell>
      <Skeleton className="mt-3 h-[116px] rounded-[20px] bg-white/15" />
    </MissionsShell>
  );
}

function Journey() {
  return (
    <RouteArt
      tone="steam"
      className="pointer-events-none absolute inset-x-0 top-[74px] h-[52px] w-full opacity-50"
    />
  );
}

/** Today's mission (or the first open weekly one) for a signed-in visitor; an invitation otherwise. */
export async function HomeMissions() {
  const t = getT();
  const session = await getServices().auth.getSession();
  if (!session) {
    return (
      <MissionsShell>
        <Link href={routes.login({ next: routes.me() })} className="block press">
          <span className="relative mt-1.5 block max-w-[17rem] font-display text-[21px] leading-[1.25] font-bold">
            {t("game.missionInvite")}
          </span>
          <Journey />
          <span className="absolute inset-x-0 bottom-0 text-[14px] text-on-hero/90">
            {t("game.startBody")}
          </span>
        </Link>
      </MissionsShell>
    );
  }
  const { missions } = await getServices().rewards.progress(session.user.id);
  const daily = missions.filter((mission) => mission.period === "day");
  const weekly = missions.filter((mission) => mission.period === "week");
  const mission = [...daily, ...weekly.filter((item) => !item.complete), ...weekly][0];
  if (!mission) return <MissionsShell>{null}</MissionsShell>;
  return (
    <MissionsShell>
      <Link href={routes.me()} className="block press">
        <span className="relative mt-1.5 block max-w-[17rem] font-display text-[21px] leading-[1.25] font-bold">
          {missionTitle(t, mission)}
        </span>
        <Journey />
        <span className="absolute inset-x-0 bottom-0 flex items-center gap-3">
          <XpBar
            fraction={mission.done / mission.target}
            className="h-2.5 flex-1"
            trackClassName="bg-white/25"
            fillClassName="bg-reward-soft"
          />
          <span className="text-[13px] font-semibold">
            {mission.complete
              ? t("game.missionDone")
              : `${formatNumber(mission.done)}/${formatNumber(mission.target)}`}
          </span>
          <span className="rounded-[12px] bg-reward-soft px-2.5 py-1 text-[12.5px] font-bold text-reward-soft-fg">
            {t("game.bonus", { count: formatNumber(mission.bonus) })}
          </span>
        </span>
      </Link>
    </MissionsShell>
  );
}
