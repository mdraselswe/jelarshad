import { Section } from "@/components/layout/section";
import { getT } from "@/i18n/server";

import { getHomeData } from "../queries";
import { FamousFoodCard, FamousFoodCardSkeleton } from "./famous-food-card";

// Horizontal, snap-scrolling row that bleeds to the screen edges on mobile.
const ROW_CLASS =
  "rise-children -mx-5 flex snap-x scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4";
const SKELETON_CARDS = 4;

function FamousFoodsShell({ children }: { children: React.ReactNode }) {
  const t = getT();
  return (
    <Section title={t("home.famousTitle")}>
      <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("home.famousHint")}</p>
      <div className={ROW_CLASS}>{children}</div>
    </Section>
  );
}

export async function FamousFoodsSection() {
  const { famous } = await getHomeData();
  if (famous.length === 0) return null;
  return (
    <FamousFoodsShell>
      {famous.map((item) => (
        <FamousFoodCard key={`${item.district.slug}/${item.food.slug}`} item={item} />
      ))}
    </FamousFoodsShell>
  );
}

export function FamousFoodsSectionSkeleton() {
  return (
    <FamousFoodsShell>
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <FamousFoodCardSkeleton key={index} />
      ))}
    </FamousFoodsShell>
  );
}
