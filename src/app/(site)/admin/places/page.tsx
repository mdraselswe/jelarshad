import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { routes } from "@/config/routes";
import { AdminButton } from "@/features/admin/components/admin-button";
import { AdminCard, AdminFrame } from "@/features/admin/components/admin-frame";
import { MergeForm, PlaceNamesForm } from "@/features/admin/components/admin-forms";
import { mergeCandidates } from "@/features/admin/merge-candidates";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("admin.sections.places"),
  description: getT()("admin.title"),
  path: "/admin/places",
  noindex: true,
});

export default function AdminPlaces() {
  return (
    <AdminFrame section="places">
      {async () => {
        const t = getT();
        const places = await getServices().admin.newPlaces();
        if (places.length === 0) return <EmptyState message={t("admin.empty")} />;
        const { repos } = getServices();
        const [candidates, searchNames] = await Promise.all([
          Promise.all(places.map((place) => mergeCandidates(place))),
          Promise.all(places.map((place) => repos.places.aliases(place.id))),
        ]);
        return (
          <>
            <p className="text-meta text-muted-foreground">{t("admin.placesHint")}</p>
            {places.map((place, index) => (
              <AdminCard key={place.id}>
                <p className="text-body font-semibold">
                  <Link href={routes.place(place.slug)} className="text-primary-text">
                    {place.nameBn}
                  </Link>
                </p>
                <p className="mt-0.5 text-meta text-muted-foreground">
                  {place.area ? `${place.area.nameBn}, ` : ""}
                  {place.district.nameBn} · {t(`placeType.${place.type}`)}
                </p>
                <PlaceNamesForm
                  placeId={place.id}
                  nameBn={place.nameBn}
                  nameEn={place.nameEn}
                  searchNames={searchNames[index] ?? []}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminButton
                    variant="destructive"
                    confirm={t("admin.hideConfirm")}
                    payload={{ kind: "hide", entity: "place", entityId: place.id }}
                  >
                    {t("admin.hide")}
                  </AdminButton>
                </div>
                <MergeForm
                  fromId={place.id}
                  fromSlug={place.slug}
                  fromName={place.nameBn}
                  candidates={candidates[index] ?? []}
                />
                <Link
                  href={`/admin/manage/${place.slug}`}
                  className="mt-3 inline-block text-meta font-semibold text-primary-text underline-offset-4 hover:underline"
                >
                  {t("admin.manageAll")}
                </Link>
              </AdminCard>
            ))}
          </>
        );
      }}
    </AdminFrame>
  );
}
