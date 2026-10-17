import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { AdminCard, AdminFrame } from "@/features/admin/components/admin-frame";
import { getT } from "@/i18n/server";
import { getServices } from "@/infrastructure/container";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("admin.sections.manage"),
  description: getT()("admin.title"),
  path: "/admin/manage",
  noindex: true,
});

/** Find a place by name, then open it to edit. With nothing typed, the newest places are listed. */
export default function AdminManage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AdminFrame section="manage">
      {async () => {
        const t = getT();
        const raw = (await searchParams).q;
        const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
        const services = getServices();
        const rows =
          q === ""
            ? (await services.admin.newPlaces(30, 30)).map((place) => ({
                slug: place.slug,
                nameBn: place.nameBn,
                where: [place.area?.nameBn, place.district.nameBn].filter(Boolean).join(", "),
              }))
            : (await services.search.search(q)).places.slice(0, 30).map((hit) => ({
                slug: hit.slug,
                nameBn: hit.nameBn,
                where: [hit.areaNameBn, hit.district.nameBn].filter(Boolean).join(", "),
              }));
        return (
          <>
            <form method="get" className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder={t("admin.manageSearch")}
                aria-label={t("admin.manageSearch")}
                className="h-11 min-w-0 flex-1 rounded-card border border-border bg-card px-3 text-body"
              />
              <button
                type="submit"
                className="h-11 press rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground"
              >
                {t("admin.manageGo")}
              </button>
            </form>
            <p className="text-meta text-muted-foreground">
              {q === "" ? t("admin.manageRecent") : t("admin.manageResults", { q })}
            </p>
            {rows.length === 0 ? (
              <EmptyState message={t("admin.empty")} />
            ) : (
              rows.map((row) => (
                <AdminCard key={row.slug}>
                  <Link href={`/admin/manage/${row.slug}`} className="block">
                    <span className="text-body font-semibold">{row.nameBn}</span>
                    <span className="block text-meta text-muted-foreground">{row.where}</span>
                  </Link>
                </AdminCard>
              ))
            )}
          </>
        );
      }}
    </AdminFrame>
  );
}
