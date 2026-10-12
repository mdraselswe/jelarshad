import { TargetIcon } from "lucide-react";
import Link from "next/link";

import { Band } from "@/components/layout/band";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";

import { MissionRow } from "./mission-row";

// The band's content is two 64px rows and a gap on every path (missions, invitation, skeleton).
const BODY = "h-[136px]";

function MissionsShell({ children }: { children: React.ReactNode }) {
  const t = getT();
  return (
    <Band tone="teal" title={t("game.missionsToday")} icon={<TargetIcon />}>
      {children}
    </Band>
  );
}

export function HomeMissionsSkeleton() {
  return (
    <MissionsShell>
      <Skeleton className={`${BODY} rounded-[20px] bg-white/15`} />
    </MissionsShell>
  );
}

/** Today's mission and the first open weekly one for a signed-in visitor; an invitation otherwise. */
export async function HomeMissions() {
  const t = getT();
  const session = await getServices().auth.getSession();
  if (!session) {
    return (
      <MissionsShell>
        <Link
          href={routes.login({ next: routes.me() })}
          className={`${BODY} flex press flex-col justify-center gap-1 rounded-[20px] bg-white/15 px-4`}
        >
          <span className="text-card-title">{t("game.startTitle")}</span>
          <span className="text-meta opacity-90">{t("game.startBody")}</span>
        </Link>
      </MissionsShell>
    );
  }
  const { missions } = await getServices().rewards.progress(session.user.id);
  const daily = missions.filter((mission) => mission.period === "day");
  const weekly = missions.filter((mission) => mission.period === "week");
  const shown = [...daily, ...weekly.filter((mission) => !mission.complete), ...weekly].slice(0, 2);
  return (
    <MissionsShell>
      <ul className={`${BODY} flex flex-col gap-2`}>
        {shown.map((mission) => (
          <MissionRow key={mission.id} mission={mission} onBand />
        ))}
      </ul>
    </MissionsShell>
  );
}
