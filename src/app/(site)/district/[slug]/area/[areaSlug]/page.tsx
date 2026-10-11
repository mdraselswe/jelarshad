import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { routes } from "@/config/routes";
import { AreaPage } from "@/features/district/components/area-page";
import { getAreaPage, getAreaSlugs } from "@/features/district/queries";
import { getT } from "@/i18n/server";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

const STATIC_AREAS = 50;

export async function generateStaticParams() {
  const areas = await getAreaSlugs(STATIC_AREAS);
  // Cache Components needs at least one param to prerender this route; an empty list would fail the build.
  return areas.length > 0
    ? areas.map(({ districtSlug, areaSlug }) => ({ slug: districtSlug, areaSlug }))
    : [{ slug: "dhaka", areaSlug: "dhanmondi" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/district/[slug]/area/[areaSlug]">): Promise<Metadata> {
  const { slug, areaSlug } = await params;
  const data = await getAreaPage(slug, areaSlug);
  if (!data) return {};
  return buildMetadata({
    // An area nobody has listed a place in is not worth indexing yet.
    noindex: data.places.length === 0,
    title: `${data.area.nameBn}, ${data.district.nameBn}`,
    description: getT()("search.areaMeta", { district: data.district.nameBn }),
    path: routes.area(slug, areaSlug),
  });
}

export default async function Area({ params }: PageProps<"/district/[slug]/area/[areaSlug]">) {
  const { slug, areaSlug } = await params;
  const data = await getAreaPage(slug, areaSlug);
  if (!data) notFound();
  return (
    <>
      <AreaPage data={data} />
      <JsonLd
        data={[
          breadcrumbLd([
            { name: getT()("nav.home"), path: routes.home() },
            { name: data.district.nameBn, path: routes.district(data.district.slug) },
            { name: data.area.nameBn, path: routes.area(data.district.slug, data.area.slug) },
          ]),
        ]}
      />
    </>
  );
}
