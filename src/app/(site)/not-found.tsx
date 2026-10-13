import Link from "next/link";

import { BowlArt, NotFoundArt, SparkleArt } from "@/components/illustration/food-art";
import { PersonArt, TreeArt, WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

/** Unknown slug or URL: say what happened and offer the two ways forward (docs: errors never dead-end). */
export default function NotFound() {
  const t = getT();
  return (
    <PageShell>
      <div className="pt-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:page-x lg:pt-12">
        <HeroBand tone="home" art={<BowlArt />} className="lg:p-12">
          <h1 className="text-title-1">{t("notFound.title")}</h1>
          <p className="mt-2 text-body text-on-hero/90">{t("notFound.body")}</p>
          <div className="mt-5 flex gap-3">
            <Button asChild variant="outline">
              <Link href={routes.search()}>{t("notFound.search")}</Link>
            </Button>
            <Button asChild variant="soft">
              <Link href={routes.home()}>{t("notFound.home")}</Link>
            </Button>
          </div>
        </HeroBand>
        <div
          aria-hidden
          className="relative hidden h-[420px] overflow-hidden rounded-[40px] bg-grad-district lg:block"
        >
          <SparkleArt className="absolute top-10 left-12 size-4" />
          <SparkleArt tone="b" delay={1200} className="absolute top-20 right-14 size-3" />
          <NotFoundArt className="absolute top-8 left-1/2 w-[240px] -translate-x-1/2" />
          <div className="absolute inset-x-0 bottom-0 origin-bottom scale-[2]">
            <WorldStrip scene="hills" />
          </div>
          <TreeArt className="absolute bottom-10 left-10 w-14" />
          <PersonArt shirt="c" className="absolute right-24 bottom-10 h-24 w-12" />
        </div>
      </div>
    </PageShell>
  );
}
