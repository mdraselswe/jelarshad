import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { routes } from "@/config/routes";
import type { AppUser } from "@/core/domain";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";

export const ADMIN_SECTIONS = [
  "reports",
  "edits",
  "places",
  "foods",
  "claims",
  "fame",
  "maintenance",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/**
 * Every /admin page sits in this: only an admin sees anything, everyone else gets the normal
 * not-found page so the area is not advertised. It reads cookies, so it needs the Suspense of loading.tsx.
 */
export async function AdminFrame({
  section,
  children,
}: {
  section?: AdminSection;
  children: (admin: AppUser) => ReactNode;
}) {
  const session = await getServices().auth.getSession();
  if (!session || session.user.role !== "admin" || session.user.isBanned) notFound();
  const t = getT();
  return (
    <PageShell>
      <SubPageBar
        backHref={section ? routes.admin() : routes.home()}
        crumbs={[
          { label: t("admin.title"), ...(section ? { href: routes.admin() } : {}) },
          ...(section ? [{ label: t(`admin.sections.${section}`) }] : []),
        ]}
      />
      <div className="page-x pt-2 lg:pt-6">
        <h1 className="font-display text-2xl font-bold">
          {section ? t(`admin.sections.${section}`) : t("admin.title")}
        </h1>
        <nav aria-label={t("admin.title")} className="mt-3 flex flex-wrap gap-1.5">
          {ADMIN_SECTIONS.map((item) => (
            <Link
              key={item}
              href={`/admin/${item}`}
              aria-current={item === section ? "page" : undefined}
              className={cn(
                "press rounded-full border px-3.5 py-1.5 text-sm font-medium",
                item === section
                  ? "border-primary-soft bg-primary-soft text-primary-soft-fg"
                  : "border-border bg-card",
              )}
            >
              {t(`admin.sections.${item}`)}
            </Link>
          ))}
        </nav>
        <div className="mt-5 flex flex-col gap-3">{children(session.user)}</div>
      </div>
    </PageShell>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return <div className="rounded-card border border-border bg-card p-3.5">{children}</div>;
}
