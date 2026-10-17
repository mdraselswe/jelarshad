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
  PlaceReactionCard,
  ReactionCardSkeleton,
} from "@/features/experience/components/reaction-card";
import { ContentActions } from "@/features/moderation/components/content-actions";
import { SaveButtonSkeleton } from "@/features/saved/components/save-button";
import { SaveControl } from "@/features/saved/components/save-control";
import { ShareButton } from "@/features/share/components/share-button";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import type { PlaceHeader } from "@/services/catalog-service";

import { PlaceBranchesSection } from "./place-branches-section";
import { PlaceClaimsSection, PlaceClaimsSectionSkeleton } from "./place-claims-section";
import { PlaceDishesSection, PlaceDishesSectionSkeleton } from "./place-dishes-section";
import { PlaceHero, PlaceHeroSkeleton } from "./place-hero";
import { PlaceInfoSection } from "./place-info-section";
import { PlacePhotosSection } from "./place-photos-section";
import { PlaceVoicesSection } from "./place-voices-section";

/**
 * Place page (docs/design: M-Place, D-Place): gradient hero, a floating "are these facts still
 * right?" card, then dishes and info. The one action ("জানান") is pinned to the bottom on phones.
 */
export function PlacePage({ place }: { place: PlaceHeader }) {
  const t = getT();
  const actions = (
    <>
      <Suspense fallback={<SaveButtonSkeleton />}>
        <SaveControl entity="place" entityId={place.id} />
      </Suspense>
      <ShareButton title={place.nameBn} path={routes.place(place.slug)} />
    </>
  );
  return (
    <PageShell
      header={
        <SubPageBar
          hideMobile
          backHref={routes.district(place.district.slug)}
          actions={actions}
          crumbs={[
            { label: place.district.nameBn, href: routes.district(place.district.slug) },
            { label: place.nameBn },
          ]}
        />
      }
    >
      <PlaceHero
        place={place}
        bar={<HeroBar backHref={routes.district(place.district.slug)} actions={actions} />}
      />
      <Suspense fallback={<PlaceClaimsSectionSkeleton />}>
        <PlaceClaimsSection placeId={place.id} />
      </Suspense>
      <Suspense fallback={null}>
        <PlacePhotosSection placeId={place.id} />
      </Suspense>
      <div className="lg:grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Suspense fallback={<PlaceDishesSectionSkeleton />}>
            <PlaceDishesSection placeId={place.id} />
          </Suspense>
          <Suspense fallback={null}>
            <PlaceVoicesSection placeId={place.id} />
          </Suspense>
        </div>
        <div className="lg:col-span-5">
          <div id="react" className="scroll-mt-4 page-x pt-6 lg:pt-10">
            <Suspense fallback={<ReactionCardSkeleton />}>
              <PlaceReactionCard placeId={place.id} />
            </Suspense>
          </div>
          <PlaceInfoSection place={place} />
          <section className="page-x pt-5">
            <div className="rounded-card-lg bg-grad-reward p-4 text-on-reward shadow-card">
              <p className="font-display text-lg font-bold">{t("place.addMoreTitle")}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed">{t("place.addMoreBody")}</p>
              <Link
                href="#react"
                className="mt-3 flex h-11 w-fit press items-center rounded-full bg-card px-5 text-sm font-semibold text-foreground"
              >
                {t("place.addMoreCta")}
              </Link>
            </div>
          </section>
          <Section title={t("moderation.moreTitle")}>
            <ContentActions
              target={{ entity: "place", entityId: place.id }}
              fields={[
                { id: "name_bn", current: place.nameBn },
                { id: "address", current: place.address },
                { id: "type", current: t(`placeType.${place.type}`) },
                { id: "phone", current: place.phone },
                { id: "website", current: place.website },
                { id: "hours_text", current: place.hoursText },
              ]}
            />
          </Section>
        </div>
      </div>
      <Suspense fallback={null}>
        <PlaceBranchesSection placeId={place.id} />
      </Suspense>
      <StickyCta href="#react" chip={`+${formatNumber(appConfig.points.experience)}`}>
        {t("place.reactCta")}
      </StickyCta>
    </PageShell>
  );
}

export function PlacePageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <PlaceHeroSkeleton bar={<HeroBar backHref={routes.home()} />} />
        <PlaceClaimsSectionSkeleton />
        <div className="lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7">
            <PlaceDishesSectionSkeleton />
          </div>
          <div className="lg:col-span-5">
            <div className="page-x pt-6 lg:pt-10">
              <ReactionCardSkeleton />
            </div>
            <Section title={<SkeletonText className="w-24" />}>
              <Skeleton className="h-[120px] rounded-[20px] lg:h-[190px]" />
            </Section>
            <section className="page-x pt-5">
              <Skeleton className="h-[148px] rounded-card-lg" />
            </section>
            <Section title={<SkeletonText className="w-36" />}>
              <div className="flex gap-2.5">
                <Skeleton className="h-11 w-36 rounded-full" />
                <Skeleton className="h-11 w-28 rounded-full" />
              </div>
            </Section>
          </div>
        </div>
      </PageShell>
    </LoadingRegion>
  );
}
