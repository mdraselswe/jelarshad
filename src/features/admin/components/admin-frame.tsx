import {
  FlagIcon,
  PencilIcon,
  ScaleIcon,
  StarIcon,
  StoreIcon,
  UtensilsIcon,
  ActivityIcon,
  WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { IconChip, type IconChipTone } from "@/components/ui/icon-chip";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
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
  "insights",
  "maintenance",
] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

const SECTION_LOOK: Record<AdminSection, { icon: ReactNode; tone: IconChipTone }> = {
  reports: { icon: <FlagIcon />, tone: "coral" },
  edits: { icon: <PencilIcon />, tone: "violet" },
  places: { icon: <StoreIcon />, tone: "sky" },
  foods: { icon: <UtensilsIcon />, tone: "amber" },
  claims: { icon: <ScaleIcon />, tone: "teal" },
  fame: { icon: <StarIcon />, tone: "reward" },
  insights: { icon: <ActivityIcon />, tone: "sky" },
  maintenance: { icon: <WrenchIcon />, tone: "green" },
};

/**
 * Every /admin page sits in this: only an admin sees anything, everyone else gets the normal
 * not-found page so the area is not advertised. A colored header, then the sections as a side list
 * on desktop and a swipeable row on phones. It reads cookies, so it needs the Suspense of loading.tsx.
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
      <HeroBand
        tone="home"
        className="pb-6 lg:pb-[150px]"
        scene={
          <div className="hidden lg:block">
            <WorldStrip scene="village" />
          </div>
        }
      >
        <p className="text-[13px] font-semibold text-on-hero/90">{t("admin.title")}</p>
        <h1 className="font-display text-[28px] leading-[1.25] font-extrabold lg:text-[40px]">
          {section ? t(`admin.sections.${section}`) : t("admin.title")}
        </h1>
      </HeroBand>
      <div className="page-x pt-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8 lg:pt-8">
        <nav
          aria-label={t("admin.title")}
          className="-mx-1 flex [scrollbar-width:none] gap-2 overflow-x-auto px-1 py-2 lg:sticky lg:top-24 lg:col-span-3 lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:rounded-[28px] lg:border lg:border-border lg:bg-card lg:p-3 lg:shadow-card"
        >
          {ADMIN_SECTIONS.map((item) => (
            <Link
              key={item}
              href={`/admin/${item}`}
              aria-current={item === section ? "page" : undefined}
              className={cn(
                "flex h-11 shrink-0 press items-center gap-2.5 rounded-[16px] px-3 text-[14px] font-semibold whitespace-nowrap lg:h-12",
                item === section
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground shadow-card lg:bg-transparent lg:shadow-none lg:hover:bg-muted",
              )}
            >
              <IconChip
                tone={SECTION_LOOK[item].tone}
                className="size-7 rounded-[10px] [&_svg]:size-4"
              >
                {SECTION_LOOK[item].icon}
              </IconChip>
              {t(`admin.sections.${item}`)}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-3 lg:col-span-9 lg:mt-0">
          {children(session.user)}
        </div>
      </div>
    </PageShell>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-4 shadow-card lg:p-5">
      {children}
    </div>
  );
}

/** The admin frame while the session is read: header, the section list and a few cards. */
export function AdminFrameSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell>
        <SubPageBar backHref={routes.home()} />
        <HeroBand
          tone="home"
          className="pb-6 lg:pb-[150px]"
          scene={
            <div className="hidden lg:block">
              <WorldStrip scene="village" />
            </div>
          }
        >
          <p className="text-[13px] font-semibold">
            <SkeletonText className="w-16" />
          </p>
          <div className="font-display text-[28px] leading-[1.25] lg:text-[40px]">
            <SkeletonText className="w-1/3" />
          </div>
        </HeroBand>
        <div className="page-x pt-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8 lg:pt-8">
          <div className="-mx-1 flex gap-2 overflow-hidden px-1 py-2 lg:col-span-3 lg:mx-0 lg:flex-col lg:gap-1.5 lg:rounded-[28px] lg:border lg:border-border lg:bg-card lg:p-3 lg:shadow-card">
            {ADMIN_SECTIONS.map((item) => (
              <Skeleton
                key={item}
                className="h-11 w-32 shrink-0 rounded-[16px] lg:h-12 lg:w-full"
              />
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 lg:col-span-9 lg:mt-0">
            <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-[104px] rounded-[24px]" />
              ))}
            </div>
            <Skeleton className="mt-3 h-6 w-40" />
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Skeleton key={index} className="h-[78px] rounded-[24px]" />
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    </LoadingRegion>
  );
}
