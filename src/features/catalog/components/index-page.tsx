import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand, type HeroTone } from "@/components/layout/hero-band";
import { HeroBar } from "@/components/layout/hero-bar";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { GroupedList, ListRowSkeleton } from "@/components/ui/grouped-list";
import { LoadingRegion, Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

/** A browse page: a hero with the title, then a filterable list (chips, search box, grouped rows). */
export function IndexPage({
  title,
  lead,
  tone,
  children,
}: {
  title: string;
  lead: string;
  tone: HeroTone;
  children: React.ReactNode;
}) {
  return (
    <PageShell
      header={<SubPageBar hideMobile backHref={routes.home()} crumbs={[{ label: title }]} />}
    >
      <HeroBand
        tone={tone}
        bleed
        scene={
          <div className="hidden lg:block">
            <WorldStrip scene="hills" />
          </div>
        }
        className="pb-12 lg:pb-[150px]"
        bar={<HeroBar backHref={routes.home()} />}
      >
        <h1 className="font-display text-[34px] leading-[1.2] font-bold lg:text-[48px]">{title}</h1>
        <p className="mt-2 max-w-md text-body text-on-hero/90">{lead}</p>
      </HeroBand>
      {children}
    </PageShell>
  );
}

export function IndexPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell header={<SubPageBar hideMobile backHref={routes.home()} />}>
        <HeroBand
          tone="food"
          bleed
          scene={
            <div className="hidden lg:block">
              <WorldStrip scene="hills" />
            </div>
          }
          className="pb-12 lg:pb-[150px]"
          bar={<HeroBar backHref={routes.home()} />}
        >
          <Skeleton className="h-10 w-1/2 rounded-[12px] bg-white/20" />
          <Skeleton className="mt-3 h-[50px] w-full max-w-md rounded-[12px] bg-white/20" />
        </HeroBand>
        <div className="flex gap-2 overflow-hidden page-x pt-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-10 w-28 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="page-x pt-5">
          <GroupedList>
            {Array.from({ length: 6 }, (_, index) => (
              <ListRowSkeleton key={index} />
            ))}
          </GroupedList>
        </div>
      </PageShell>
    </LoadingRegion>
  );
}
