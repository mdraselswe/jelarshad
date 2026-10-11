import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/layout/empty-state";
import { routes } from "@/config/routes";
import { AdminButton } from "@/features/admin/components/admin-button";
import { AdminCard, AdminFrame } from "@/features/admin/components/admin-frame";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("admin.sections.foods"),
  description: getT()("admin.title"),
  path: "/admin/foods",
  noindex: true,
});

export default function AdminFoods() {
  return (
    <AdminFrame section="foods">
      {async () => {
        const t = getT();
        const pairs = await getServices().admin.duplicateFoods();
        if (pairs.length === 0) return <EmptyState message={t("admin.empty")} />;
        return (
          <>
            <p className="text-meta text-muted-foreground">{t("admin.foodsHint")}</p>
            {pairs.map(({ a, b, similarity }) => (
              <AdminCard key={`${a.id}:${b.id}`}>
                <p className="text-meta text-muted-foreground">
                  {t("admin.similarity", { percent: formatNumber(Math.round(similarity * 100)) })}
                </p>
                {[a, b].map((food) => (
                  <p key={food.id} className="mt-1 text-body font-semibold">
                    <Link href={routes.food(food.slug)} className="text-primary-text">
                      {food.nameBn}
                    </Link>{" "}
                    <span className="text-meta font-normal text-muted-foreground">
                      {food.slug} ·{" "}
                      {t("admin.experiences", { count: formatNumber(food.experienceCount) })}
                    </span>
                  </p>
                ))}
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdminButton
                    confirm={t("admin.mergeFoodConfirm")}
                    payload={{ kind: "merge-food", fromId: b.id, intoId: a.id }}
                  >
                    {t("admin.mergeFoodInto", { name: a.nameBn })}
                  </AdminButton>
                  <AdminButton
                    confirm={t("admin.mergeFoodConfirm")}
                    payload={{ kind: "merge-food", fromId: a.id, intoId: b.id }}
                  >
                    {t("admin.mergeFoodInto", { name: b.nameBn })}
                  </AdminButton>
                </div>
              </AdminCard>
            ))}
          </>
        );
      }}
    </AdminFrame>
  );
}
