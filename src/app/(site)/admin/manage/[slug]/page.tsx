import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { routes } from "@/config/routes";
import { AdminButton } from "@/features/admin/components/admin-button";
import { MergeForm } from "@/features/admin/components/admin-forms";
import { AdminCard, AdminFrame } from "@/features/admin/components/admin-frame";
import { AreaRenameForm, PlaceEditForm } from "@/features/admin/components/place-edit-form";
import { getT } from "@/i18n/server";
import { getServices } from "@/infrastructure/container";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("admin.sections.manage"),
  description: getT()("admin.title"),
  path: "/admin/manage",
  noindex: true,
});

export default function AdminManagePlace({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <AdminFrame section="manage">
      {async () => {
        const t = getT();
        const { slug } = await params;
        const { repos } = getServices();
        const place = await repos.places.bySlug(slug);
        if (!place) notFound();
        const brands = await repos.places.brandList(200);
        return (
          <>
            <a
              href={routes.place(place.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-meta font-semibold text-primary-text underline-offset-4 hover:underline"
            >
              {t("admin.manageOpenPage")}
            </a>
            <AdminCard>
              <PlaceEditForm
                initial={{
                  placeId: place.id,
                  nameBn: place.nameBn,
                  type: place.type,
                  address: place.address ?? "",
                  phone: place.phone ?? "",
                  website: place.website ?? "",
                  hoursText: place.hoursText ?? "",
                  areaName: place.area?.nameBn ?? "",
                  brandSlug: place.brand?.slug ?? "",
                }}
                brands={brands.map((brand) => ({ slug: brand.slug, nameBn: brand.nameBn }))}
              />
            </AdminCard>
            {place.area ? (
              <AdminCard>
                <p className="mb-2 text-body font-semibold">{t("admin.areaRename")}</p>
                <p className="mb-2 text-meta text-muted-foreground">{t("admin.areaRenameHint")}</p>
                <AreaRenameForm areaId={place.area.id} current={place.area.nameBn} />
              </AdminCard>
            ) : null}
            <AdminCard>
              <p className="text-body font-semibold">{t("admin.manageDuplicate")}</p>
              <MergeForm fromId={place.id} />
            </AdminCard>
            <AdminCard>
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 text-body">{t("admin.manageHide")}</span>
                <AdminButton
                  confirm={t("admin.hideConfirm")}
                  payload={{ kind: "hide", entity: "place", entityId: place.id }}
                >
                  {t("admin.hide")}
                </AdminButton>
              </div>
            </AdminCard>
          </>
        );
      }}
    </AdminFrame>
  );
}
