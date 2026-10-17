import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonPage } from "@/features/leaderboard/components/person-page";
import { getT } from "@/i18n/server";
import { getServices } from "@/infrastructure/container";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("person.title"),
  description: getT()("person.note"),
  path: "/people",
  // A person's page is for people who found it from the contributors list; search engines skip it.
  noindex: true,
});

// Cache Components needs at least one param to prerender this route; every real page renders per
// request (it depends on the person's current opt-in), so this entry is only a placeholder.
const PLACEHOLDER = "placeholder";
export function generateStaticParams() {
  return [{ id: PLACEHOLDER }];
}

export default async function Person({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The build prerenders the placeholder; it is not a person, and the build has no database key.
  if (id === PLACEHOLDER) notFound();
  const profile = await getServices().rewards.publicProfile(id);
  if (!profile) notFound();
  return <PersonPage id={id} profile={profile} />;
}
