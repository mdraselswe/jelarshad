import Link from "next/link";
import { Suspense } from "react";

import { LogoMark } from "@/components/brand/logo";
import { BowlArt, CloudArt, CupArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { QUICK_SEARCHES } from "@/config/home";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { HomePassport } from "@/features/passport/components/passport-section";
import { SearchEntry } from "@/features/search/components/search-entry";
import { getT } from "@/i18n/server";

import { HomeGreeting } from "./home-greeting";
import { HomePoints } from "./home-points";

/**
 * Top of the home page (docs/design: C-Home, desktop/Main). On phones the gradient runs to the top of
 * the screen and holds the brand row; from 1024px it is a card with the passport beside the search.
 * Static: renders for real in the page and in its skeleton.
 */
export function HomeHero() {
  const t = getT();
  return (
    <HeroBand
      tone="home"
      bleed
      className="pb-[132px] lg:pb-[150px]"
      scene={<WorldStrip scene="hills" />}
      bar={
        <>
          <Link
            href={routes.home()}
            aria-label={siteConfig.name}
            className="flex items-center gap-2.5 !bg-transparent font-display text-xl font-extrabold"
          >
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-[12px] bg-card"
            >
              <LogoMark title="" className="size-7" />
            </span>
            {siteConfig.name}
          </Link>
          <Suspense fallback={null}>
            <HomePoints className="bg-white/20 text-on-hero" />
          </Suspense>
        </>
      }
    >
      <CloudArt className="pointer-events-none absolute -top-2 left-[44%] hidden w-32 opacity-25 lg:block" />
      <BowlArt className="pointer-events-none absolute top-3 -right-1 w-[150px] lg:-top-9 lg:right-8 lg:w-[112px]" />
      <CupArt className="pointer-events-none absolute top-[8px] right-[140px] hidden w-14 lg:-top-7 lg:right-40 lg:block" />
      <div className="lg:grid lg:grid-cols-[1.45fr_1fr] lg:items-center lg:gap-12">
        <div>
          <div className="mb-2 min-h-[26px] lg:hidden">
            <Suspense fallback={null}>
              <HomeGreeting />
            </Suspense>
          </div>
          <h1 className="h-[92px] max-w-[14.5rem] font-display text-[38px] leading-[1.2] font-extrabold lg:h-auto lg:max-w-none lg:text-[52px] lg:leading-[1.2] lg:font-bold">
            {t("home.title")}
          </h1>
          <p className="mt-2 h-[44px] max-w-[14.5rem] text-[14.5px] leading-[1.5] text-on-hero/90 lg:mt-1.5 lg:h-auto lg:max-w-xl lg:text-lg">
            {t("home.subtitle")}
          </p>
          <SearchEntry
            withButton
            className="mt-6 h-[54px] rounded-[18px] border-0 text-[15px] shadow-floating lg:mt-6 lg:h-16 lg:max-w-[600px] lg:rounded-full lg:text-lg"
          />
          <ul className="mt-4 hidden flex-wrap gap-2.5 lg:flex">
            {QUICK_SEARCHES.map((term) => (
              <li key={term}>
                <Link
                  href={routes.search({ q: term })}
                  className="flex h-10 press items-center rounded-full bg-white/20 px-4 text-[15px] font-semibold"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="hidden lg:block">
          <Suspense fallback={<div className="h-[172px] rounded-card-lg bg-white/20" />}>
            <HomePassport />
          </Suspense>
        </div>
      </div>
    </HeroBand>
  );
}
