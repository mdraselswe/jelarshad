import { TrophyIcon } from "lucide-react";
import Link from "next/link";

import { Panel } from "@/components/layout/panel";
import { RankBadge } from "@/components/ui/rank-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";

import { LeaderboardToggle } from "./leaderboard-toggle";

// The list is three 56px rows (or the invitation in the same box) and the switch row is 72px, for
// the signed-in visitor, the guest and the skeleton alike, so the panel never changes height.
const LIST = "h-[168px]";
const SWITCH = "h-[72px]";

function BoardShell({ children }: { children: React.ReactNode }) {
  const t = getT();
  return (
    <Panel title={t("game.districtBoardTitle")} icon={<TrophyIcon />} tone="amber">
      <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("game.boardHint")}</p>
      {children}
    </Panel>
  );
}

export function DistrictBoardSkeleton() {
  return (
    <BoardShell>
      <Skeleton className={cn(LIST, "rounded-[20px]")} />
      <Skeleton className="mt-3 h-11 rounded-full" />
      <Skeleton className={cn(SWITCH, "mt-3 rounded-[20px]")} />
    </BoardShell>
  );
}

/**
 * This week's most active people in one district, among those who chose to be listed. Reads the
 * session, so it sits behind Suspense on the (otherwise cached) district page.
 */
export async function DistrictBoard({ districtId }: { districtId: number }) {
  const t = getT();
  const services = getServices();
  const session = await services.auth.getSession();
  const board = await services.rewards.districtLeaderboard(districtId, session?.user.id ?? null);
  const userId = session?.user.id ?? null;
  return (
    <BoardShell>
      {board.entries.length === 0 ? (
        <p
          className={cn(
            LIST,
            "flex items-center justify-center rounded-[20px] bg-primary-soft px-4 text-center text-meta",
          )}
        >
          {t("game.boardEmpty")}
        </p>
      ) : (
        <ol
          className={cn(
            LIST,
            "divide-y divide-divider overflow-hidden rounded-[20px] bg-primary-soft/50 px-4",
          )}
        >
          {board.entries.map((entry, index) => (
            <li key={entry.userId} className="flex h-14 items-center gap-3">
              <RankBadge rank={index + 1} className="size-9 rounded-[12px] text-base" />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {entry.userId === userId
                  ? `${entry.displayName} (${t("game.boardYou")})`
                  : entry.displayName}
              </span>
              <span className="text-sm font-semibold text-reward-soft-fg">
                {t("game.xp", { count: formatNumber(entry.xp) })}
              </span>
            </li>
          ))}
        </ol>
      )}
      <Link
        href={routes.leaderboard()}
        className="mt-3 flex h-11 press items-center justify-center rounded-full bg-primary-soft text-[15px] font-semibold text-primary-soft-fg"
      >
        {t("leaderboard.seeAll")}
      </Link>
      <div className="mt-3">
        {userId ? (
          <LeaderboardToggle initial={board.optedIn ?? false} className={SWITCH} />
        ) : (
          <Link
            href={routes.login({ next: routes.me() })}
            className={cn(
              SWITCH,
              "flex press items-center rounded-[20px] bg-card px-4 text-card-title text-primary-text",
            )}
          >
            {t("game.boardLogin")}
          </Link>
        )}
      </div>
    </BoardShell>
  );
}
