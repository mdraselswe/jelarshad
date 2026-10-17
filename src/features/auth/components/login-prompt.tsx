import { FlameIcon, MedalIcon, TrophyIcon } from "lucide-react";

import { SparkleArt, TrophyArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { IconChip } from "@/components/ui/icon-chip";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { clientEnv } from "@/config/env";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

/**
 * Asks for Google sign-in. A plain link to the sign-in route: no JavaScript needed, and the browser
 * leaves the site exactly as it does for any OAuth button.
 */
export function LoginPrompt({ next, failed = false }: { next: string; failed?: boolean }) {
  const t = getT();
  return (
    <PageShell>
      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:page-x lg:pt-10">
        <div>
          <div className="lg:max-w-xl">
            <HeroBand tone="home" art={<TrophyArt />} className="lg:p-10">
              <h1 className="text-title-1">{t("auth.loginTitle")}</h1>
              <p className="mt-2 text-body text-on-hero/90">{t("auth.loginBody")}</p>
            </HeroBand>
          </div>
          <section className="page-x pt-5 lg:max-w-xl">
            {failed ? (
              <p
                role="alert"
                className="mt-3 rounded-input bg-danger-soft px-3.5 py-2.5 text-meta text-danger-fg"
              >
                {t("auth.loginError")}
              </p>
            ) : null}
            <ul className="mb-4 flex flex-col gap-2.5">
              {[
                { icon: <TrophyIcon />, tone: "reward", text: t("auth.perks.xp") },
                { icon: <MedalIcon />, tone: "violet", text: t("auth.perks.stamp") },
                { icon: <FlameIcon />, tone: "coral", text: t("auth.perks.streak") },
              ].map((perk) => (
                <li
                  key={perk.text}
                  className="flex items-center gap-3 rounded-[20px] border border-border bg-card p-3 shadow-card"
                >
                  <IconChip tone={perk.tone as "reward" | "violet" | "coral"}>{perk.icon}</IconChip>
                  <span className="text-card-title">{perk.text}</span>
                </li>
              ))}
            </ul>
            <a
              href={routes.signIn(next)}
              className="flex h-14 press items-center justify-center rounded-button bg-primary bg-grad-action px-5 text-[17px] font-semibold text-primary-foreground"
            >
              {t("auth.google")}
            </a>
            {clientEnv.NEXT_PUBLIC_FACEBOOK_LOGIN ? (
              <a
                href={routes.signIn(next, "facebook")}
                className="mt-3 flex h-14 press items-center justify-center rounded-button border border-border bg-card px-5 text-[17px] font-semibold"
              >
                {t("auth.facebook")}
              </a>
            ) : null}
          </section>
        </div>
        <div
          aria-hidden
          className="relative hidden h-[460px] overflow-hidden rounded-[40px] bg-grad-district lg:block"
        >
          <SparkleArt className="absolute top-10 left-12 size-4" />
          <SparkleArt tone="b" delay={1200} className="absolute top-24 right-16 size-3" />
          <TrophyArt className="absolute top-16 left-1/2 h-[170px] w-[150px] -translate-x-1/2" />
          <div className="absolute inset-x-0 bottom-0 origin-bottom scale-[2]">
            <WorldStrip scene="village" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/** Same two columns as the prompt: hero, three perks and the button; the scene card on desktop. */
export function LoginPromptSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell>
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:page-x lg:pt-10">
          <div>
            <div className="lg:max-w-xl">
              <HeroBand tone="home" art={<TrophyArt />} className="lg:p-10">
                <div className="text-title-1">
                  <SkeletonText className="w-1/2" />
                </div>
                <div className="mt-2 text-body">
                  <SkeletonText className="w-full" />
                  <SkeletonText className="mt-1 w-3/4" />
                </div>
              </HeroBand>
            </div>
            <section className="page-x pt-5 lg:max-w-xl">
              <ul className="mb-4 flex flex-col gap-2.5">
                {[0, 1, 2].map((index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 rounded-[20px] border border-border bg-card p-3 shadow-card"
                  >
                    <Skeleton className="size-9 shrink-0 rounded-[12px]" />
                    <div className="min-w-0 flex-1 text-card-title">
                      <SkeletonText className="w-2/3" />
                    </div>
                  </li>
                ))}
              </ul>
              <Skeleton className="h-14 rounded-button" />
            </section>
          </div>
          <Skeleton className="hidden h-[460px] rounded-[40px] lg:block" />
        </div>
      </PageShell>
    </LoadingRegion>
  );
}
