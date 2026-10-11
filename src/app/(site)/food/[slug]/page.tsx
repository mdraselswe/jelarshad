import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { routes } from "@/config/routes";
import { getStaticSlugs } from "@/features/catalog/queries";
import { FoodPage } from "@/features/food/components/food-page";
import { getFoodHeader, getFoodRedirect } from "@/features/food/queries";
import { getT } from "@/i18n/server";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  const { foods } = await getStaticSlugs();
  return foods.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/food/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFoodHeader(slug);
  if (!food) return {};
  return buildMetadata({
    // A food nobody has tried and no district lists has nothing to show yet.
    noindex: food.experienceCount === 0 && food.famousIn.length === 0,
    title: food.nameBn,
    description: food.aboutBn ?? getT()("food.dishesAll"),
    path: routes.food(slug),
  });
}

export default async function Food({ params }: PageProps<"/food/[slug]">) {
  const { slug } = await params;
  const food = await getFoodHeader(slug);
  if (!food) {
    const target = await getFoodRedirect(slug);
    if (target) permanentRedirect(routes.food(target));
    notFound();
  }
  return (
    <>
      <FoodPage food={food} />
      <JsonLd
        data={breadcrumbLd([
          { name: getT()("nav.home"), path: routes.home() },
          { name: food.nameBn, path: routes.food(food.slug) },
        ])}
      />
    </>
  );
}
