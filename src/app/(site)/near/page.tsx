import type { Metadata } from "next";

import { IndexPage } from "@/features/catalog/components/index-page";
import { NearMe } from "@/features/near/components/near-me";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("near.title"),
  description: getT()("near.lead"),
  path: routes.near(),
});

/** "আমার কাছে": the browser's position answers which neighbourhoods and places are around. */
export default function Near() {
  const t = getT();
  return (
    <IndexPage title={t("near.title")} lead={t("near.lead")} tone="district">
      <NearMe />
    </IndexPage>
  );
}
