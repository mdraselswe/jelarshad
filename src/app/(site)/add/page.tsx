import type { Metadata } from "next";

import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { routes } from "@/config/routes";
import { AddFlow } from "@/features/add/components/add-flow";
import { LoginGate } from "@/features/auth/components/login-gate";
import { getDistrictOptions } from "@/features/catalog/queries";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("add.title"),
  description: getT()("add.food"),
  path: "/add",
  noindex: true,
});

export default function Add() {
  const t = getT();
  return (
    <LoginGate next={routes.add()}>
      {async () => {
        const districts = await getDistrictOptions();
        return (
          <PageShell>
            <HeroBand tone="home" className="lg:mx-auto lg:max-w-2xl lg:p-10">
              <h1 className="text-title-1">{t("add.title")}</h1>
            </HeroBand>
            <section className="page-x pt-4 lg:pt-6">
              <AddFlow districts={districts} />
            </section>
          </PageShell>
        );
      }}
    </LoginGate>
  );
}
