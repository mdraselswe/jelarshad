import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { routes } from "@/config/routes";
import { BrandPage } from "@/features/brand/components/brand-page";
import { getBrandPage } from "@/features/brand/queries";
import { getT } from "@/i18n/server";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getBrandPage(slug);
  if (!data) return {};
  return buildMetadata({
    title: data.brand.nameBn,
    description: getT()("brand.note"),
    path: routes.brand(slug),
  });
}

export default async function Brand({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getBrandPage(slug);
  if (!data) notFound();
  return (
    <>
      <BrandPage data={data} />
      <JsonLd
        data={[
          breadcrumbLd([
            { name: getT()("nav.home"), path: routes.home() },
            { name: data.brand.nameBn, path: routes.brand(data.brand.slug) },
          ]),
        ]}
      />
    </>
  );
}
