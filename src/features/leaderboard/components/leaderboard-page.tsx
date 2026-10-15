import Link from "next/link";
import { Suspense } from "react";

import { Confetti, TrophyArt } from "@/components/illustration/podium-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { LeaderboardToggle } from "@/features/game/components/leaderboard-toggle";
import { getT } from "@/i18n/server";
import { getServices } from "@/infrastructure/container";
import { cn } from "@/lib/cn";

import { BoardView } from "./board-view";
import { PeriodSwitch } from "./period-switch";

/** Tab row 48 + gap 20 + podium (avatar, name, xp, pillar) 258 + list heading and rows. */
const PODIUM_HEIGHT = "h-[286px]";

function Hero() {
  const t = getT();
  return (
    <HeroBand
      tone="home"
      bleed
      fx={<Confetti />}
      scene={
        <div className="hidden lg:block">
          <WorldStrip scene="hills" />
        </div>
      }
      className="pb-12 lg:pb-[150px]"
      bar={<HeroBar backHref={routes.home()} />}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[34px] leading-[1.2] font-bold lg:text-[48px]">
            {t("leaderboard.title")}
          </h1>
          <p className="mt-2 max-w-md text-body text-on-hero/90">{t("leaderboard.lead")}</p>
        </div>
        <TrophyArt className="w-24 shrink-0 lg:w-36" />
      </div>
    </HeroBand>
  );
}

/** Reads the session (for "you" and the opt-in switch), so it sits behind Suspense. */
async function Boards() {
  const t = getT();
  const services = getServices();
  const session = await services.auth.getSession();
  const userId = session?.user.id ?? null;
  const board = await services.rewards.leaderboardPage(userId);
  const view = (entries: typeof board.week) => <BoardView entries={entries} userId={userId} />;
  return (
    <div className="page-x pt-6 lg:pt-8">
      <PeriodSwitch
        label={t("leaderboard.periodsLabel")}
        periods={[
          { id: "week", label: t("leaderboard.week") },
          { id: "month", label: t("leaderboard.month") },
          { id: "all", label: t("leaderboard.all") },
        ]}
        panels={{ week: view(board.week), month: view(board.month), all: view(board.all) }}
      />
      <div className="mx-auto mt-6 max-w-md">
        {userId ? (
          <LeaderboardToggle initial={board.optedIn ?? false} className="h-[72px] shadow-card" />
        ) : (
          <Link
            href={routes.login({ next: routes.leaderboard() })}
            className="flex h-[72px] press items-center rounded-[20px] bg-card px-4 text-card-title text-primary-text shadow-card"
          >
            {t("game.boardLogin")}
          </Link>
        )}
        <p className="mt-3 text-center text-meta text-muted-foreground">{t("leaderboard.note")}</p>
      </div>
    </div>
  );
}

function BoardsSkeleton() {
  return (
    <div className="page-x pt-6 lg:pt-8">
      <Skeleton className="mx-auto h-[52px] w-full max-w-md rounded-full" />
      <div className="mt-5">
        <Skeleton className={cn(PODIUM_HEIGHT, "mx-auto max-w-md rounded-[22px] lg:max-w-xl")} />
        <div className="mx-auto mt-6 max-w-2xl">
          <div className="mb-3 px-1 text-heading">
            <SkeletonText className="w-32" />
          </div>
          <Skeleton className="h-[236px] rounded-[28px]" />
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-md">
        <Skeleton className="h-[72px] rounded-[20px]" />
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const t = getT();
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.home()}
          crumbs={[{ label: t("leaderboard.navTitle") }]}
        />
      }
    >
      <Hero />
      <Suspense fallback={<BoardsSkeleton />}>
        <Boards />
      </Suspense>
    </PageShell>
  );
}

export function LeaderboardPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <Hero />
        <BoardsSkeleton />
      </PageShell>
    </LoadingRegion>
  );
}
