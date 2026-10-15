import { MapPinIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { Section } from "@/components/layout/section";
import { StickyCta } from "@/components/layout/sticky-cta";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { appConfig } from "@/config/app.config";
import { routes } from "@/config/routes";
import {
  FoodReactionCard,
  ReactionCardSkeleton,
} from "@/features/experience/components/reaction-card";
import { ContentActions } from "@/features/moderation/components/content-actions";
import { SaveButtonSkeleton } from "@/features/saved/components/save-button";
import { SaveControl } from "@/features/saved/components/save-control";
import { ShareButton } from "@/features/share/components/share-button";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import { toneClass } from "@/lib/tone";
import type { FoodHeader } from "@/services/catalog-service";

import { FoodDishesSection, FoodDishesSectionSkeleton } from "./food-dishes-section";
import { FoodHero, FoodHeroSkeleton } from "./food-hero";
import { FoodStatsStrip } from "./food-stats-card";
import { FoodVoicesSection, FoodVoicesSectionSkeleton } from "./food-voices-section";

function FamousInChips({ food }: { food: FoodHeader }) {
  const t = getT();
  return (
    <ul className="flex flex-wrap gap-2.5">
      {food.famousIn.map((district) => (
        <li key={district.slug}>
          <Link
            href={routes.districtFood(district.slug, food.slug)}
            className={`flex h-11 press items-center rounded-full px-4 text-[15px] font-semibold ${toneClass(district.slug)}`}
          >
            {t("food.famousIn", { district: district.nameBn })}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Food page (docs/design: M-Food, D-Food): gradient hero, the score card, the districts it is famous
 * for, then dishes and comments streaming in. From 1024px the lists take 8 of 12 columns and the
 * sidebar the rest.
 */
export function FoodPage({ food }: { food: FoodHeader }) {
  const t = getT();
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.home()}
          crumbs={[{ label: t("breadcrumb.foods") }, { label: food.nameBn }]}
          actions={
            <>
              <Suspense fallback={<SaveButtonSkeleton />}>
                <SaveControl entity="food" entityId={food.id} />
              </Suspense>
              <ShareButton title={food.nameBn} path={routes.food(food.slug)} />
            </>
          }
        />
      }
    >
      <FoodHero
        food={food}
        bar={
          <HeroBar
            backHref={routes.home()}
            actions={
              <>
                <Suspense fallback={<SaveButtonSkeleton />}>
                  <SaveControl entity="food" entityId={food.id} />
                </Suspense>
                <ShareButton title={food.nameBn} path={routes.food(food.slug)} />
              </>
            }
          />
        }
      />
      <div className="relative z-10 -mt-5 page-x lg:hidden">
        <FoodStatsStrip food={food} reward={`+${formatNumber(appConfig.points.experience)}`} />
      </div>
      {food.famousIn.length > 0 ? (
        <Section
          title={t("food.famousInTitle")}
          icon={<MapPinIcon />}
          tone="teal"
          className="lg:hidden"
        >
          <FamousInChips food={food} />
        </Section>
      ) : null}
      <div id="react" className="scroll-mt-4 page-x pt-5 lg:hidden">
        <Suspense fallback={<ReactionCardSkeleton />}>
          <FoodReactionCard foodId={food.id} />
        </Suspense>
      </div>
      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Suspense fallback={<FoodDishesSectionSkeleton />}>
            <FoodDishesSection foodId={food.id} />
          </Suspense>
          <Suspense fallback={<FoodVoicesSectionSkeleton />}>
            <FoodVoicesSection foodId={food.id} />
          </Suspense>
          <Section title={t("moderation.moreTitle")}>
            <ContentActions
              target={{ entity: "food", entityId: food.id }}
              fields={[
                { id: "name_bn", current: food.nameBn },
                { id: "about_bn", current: food.aboutBn },
              ]}
            />
          </Section>
        </div>
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-14 flex flex-col gap-4 page-x pt-10">
            <Suspense fallback={<ReactionCardSkeleton />}>
              <FoodReactionCard foodId={food.id} />
            </Suspense>
            {food.famousIn.length > 0 ? (
              <div className="rounded-card-lg border border-border bg-card p-5.5 shadow-card">
                <h2 className="mb-3 text-heading">{t("food.famousInTitle")}</h2>
                <FamousInChips food={food} />
                <p className="mt-3 text-caption text-muted-foreground">{t("home.famousHint")}</p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
      <StickyCta href="#react" chip={`+${formatNumber(appConfig.points.experience)}`}>
        {t("food.reactCta", { food: food.nameBn })}
      </StickyCta>
    </PageShell>
  );
}

export function FoodPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <FoodHeroSkeleton bar={<HeroBar backHref={routes.home()} />} />
        <div className="relative z-10 -mt-5 page-x lg:hidden">
          <ul className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((index) => (
              <li key={index}>
                <Skeleton className="h-[73px] rounded-[22px]" />
              </li>
            ))}
          </ul>
        </div>
        <Section
          title={<SkeletonText className="w-32" />}
          icon={<MapPinIcon />}
          tone="teal"
          className="lg:hidden"
        >
          <Skeleton className="h-11 w-44 rounded-full" />
        </Section>
        <div className="page-x pt-5 lg:hidden">
          <ReactionCardSkeleton />
        </div>
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-8">
            <FoodDishesSectionSkeleton />
            <FoodVoicesSectionSkeleton />
            <Section title={<SkeletonText className="w-40" />}>
              <div className="flex gap-2.5">
                <Skeleton className="h-11 w-36 rounded-full" />
                <Skeleton className="h-11 w-28 rounded-full" />
              </div>
            </Section>
          </div>
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="flex flex-col gap-4 page-x pt-10">
              <ReactionCardSkeleton />
            </div>
          </aside>
        </div>
      </PageShell>
    </LoadingRegion>
  );
}
