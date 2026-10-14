import { BowlArt } from "@/components/illustration/food-art";
import { WorldStrip } from "@/components/illustration/world-art";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { LoadingRegion, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";

/** Hero, the step bar and the first form card; on desktop all three cards and the earn-XP card. */
export function AddPageSkeleton() {
  const t = getT();
  return (
    <LoadingRegion label={t("common.loading")}>
      <PageShell>
        <HeroBand
          tone="home"
          art={<BowlArt />}
          scene={
            <div className="hidden lg:block">
              <WorldStrip scene="river" />
            </div>
          }
          className="lg:pt-10 lg:pb-[150px]"
        >
          <div className="text-title-1">
            <SkeletonText className="w-1/3" />
          </div>
        </HeroBand>
        <div className="page-x pt-4 lg:grid lg:grid-cols-12 lg:items-start lg:gap-8 lg:pt-8">
          <section className="flex flex-col gap-4 lg:col-span-7">
            <div className="lg:hidden">
              <Skeleton className="h-5 w-16" />
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} className="h-1.5 flex-1 rounded-full" />
                ))}
              </div>
            </div>
            {[
              { body: "h-14", extra: 0 },
              { body: "h-[210px]", extra: 1 },
              { body: "h-[330px]", extra: 1 },
            ].map((card, index) => (
              <div
                key={index}
                className={
                  index === 0
                    ? "rounded-[28px] border border-border bg-card p-4 shadow-card"
                    : "hidden rounded-[28px] border border-border bg-card p-4 shadow-card lg:block"
                }
              >
                <Skeleton className="h-9 w-40" />
                <Skeleton className={`mt-4 ${card.body} rounded-input`} />
                {index === 0 ? <Skeleton className="mt-4 h-12 rounded-full lg:hidden" /> : null}
              </div>
            ))}
            <Skeleton className="hidden h-14 rounded-button lg:block" />
          </section>
          <aside className="hidden lg:sticky lg:top-24 lg:col-span-5 lg:block">
            <Skeleton className="h-[260px] rounded-[32px]" />
          </aside>
        </div>
      </PageShell>
    </LoadingRegion>
  );
}
