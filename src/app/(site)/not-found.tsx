import Link from "next/link";

import { BowlArt } from "@/components/illustration/food-art";
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
      <div className="pt-4 lg:mx-auto lg:max-w-2xl">
        <HeroBand tone="home" art={<BowlArt />} className="lg:p-10">
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
      </div>
    </PageShell>
  );
}
