import type { Metadata } from "next";
import { CompassIcon, StoreIcon, UtensilsIcon } from "lucide-react";

import { BowlArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { IconChip } from "@/components/ui/icon-chip";
import { appConfig } from "@/config/app.config";
import { routes } from "@/config/routes";
import { AddFlow } from "@/features/add/components/add-flow";
import { LoginGate } from "@/features/auth/components/login-gate";
import { getDistrictOptions } from "@/features/catalog/queries";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("add.title"),
  description: getT()("add.food"),
  path: "/add",
  noindex: true,
});

export default function Add() {
  const t = getT();
  const perks = [
    {
      icon: <UtensilsIcon />,
      tone: "coral",
      text: t("add.perkExperience"),
      xp: appConfig.points.experience,
    },
    {
      icon: <StoreIcon />,
      tone: "violet",
      text: t("add.perkPlace"),
      xp: appConfig.points.place_create,
    },
    {
      icon: <CompassIcon />,
      tone: "teal",
      text: t("add.perkDiscoverer"),
      xp: appConfig.points.discoverer,
    },
  ] as const;
  return (
    <LoginGate next={routes.add()}>
      {async () => {
        const districts = await getDistrictOptions();
        return (
          <PageShell>
            <HeroBand
              tone="home"
              art={<BowlArt />}
              scene={
                <div className="hidden lg:block">
                  <WorldStrip scene="river" />
                </div>
              }
              className="lg:pt-10 lg:pb-[150px]"
            >
              <h1 className="text-title-1">{t("add.title")}</h1>
            </HeroBand>
            <div className="page-x pt-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8 lg:pt-8">
              <section className="lg:col-span-7">
                <AddFlow districts={districts} />
              </section>
              <aside className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block">
                <div className="rounded-[32px] border border-border bg-card p-6 shadow-card">
                  <h2 className="text-heading">{t("add.perksTitle")}</h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {perks.map((perk) => (
                      <li
                        key={perk.text}
                        className="flex items-center gap-3 rounded-[20px] bg-primary-soft/60 p-3"
                      >
                        <IconChip tone={perk.tone}>{perk.icon}</IconChip>
                        <span className="min-w-0 flex-1 text-card-title">{perk.text}</span>
                        <span className="rounded-full bg-reward-soft px-2.5 py-1 text-[13px] font-bold text-reward-soft-fg">
                          +{formatNumber(perk.xp)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </PageShell>
        );
      }}
    </LoginGate>
  );
}
