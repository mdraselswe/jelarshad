import { HeartIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Panel } from "@/components/layout/panel";
import { GroupedList, ListRow, ListRowSkeleton, ListTile } from "@/components/ui/grouped-list";
import { ScorePill } from "@/components/ui/score-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { HOME_FAMOUS_ROWS } from "@/config/home";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { HomeFamous } from "@/services/catalog-service";

import { getHomeData } from "../queries";

/** Editors' order, one row per food so the list is not five breads in a row. */
export function pickFamousRows(famous: HomeFamous[], count: number): HomeFamous[] {
  const seen = new Set<string>();
  const picked: HomeFamous[] = [];
  for (const item of famous) {
    if (seen.has(item.food.slug)) continue;
    seen.add(item.food.slug);
    picked.push(item);
    if (picked.length === count) break;
  }
  return picked;
}

function FamousShell({ children }: { children: ReactNode }) {
  const t = getT();
  return (
    <Panel
      title={t("home.famousTitle")}
      icon={<HeartIcon />}
      tone="coral"
      action={
        <Link href={routes.search()} className="text-sm font-semibold text-primary-text">
          {t("home.seeAll")}
        </Link>
      }
    >
      <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("home.famousHint")}</p>
      <GroupedList className="rounded-none border-0 bg-transparent">{children}</GroupedList>
    </Panel>
  );
}

export async function HomeFamousList() {
  const { famous } = await getHomeData();
  const rows = pickFamousRows(famous, HOME_FAMOUS_ROWS);
  if (rows.length === 0) return null;
  return (
    <FamousShell>
      {rows.map((item) => (
        <ListRow
          key={`${item.district.slug}/${item.food.slug}`}
          href={routes.districtFood(item.district.slug, item.food.slug)}
          leading={<ListTile seed={item.food.slug}>{item.food.nameBn.slice(0, 1)}</ListTile>}
          title={item.food.nameBn}
          meta={[item.district.nameBn, item.noteBn].filter(Boolean).join(" · ")}
          trailing={<ScorePill display={{ percent: null }} />}
        />
      ))}
    </FamousShell>
  );
}

export function HomeFamousListSkeleton() {
  return (
    <FamousShell>
      {Array.from({ length: HOME_FAMOUS_ROWS }, (_, index) => (
        <ListRowSkeleton
          key={index}
          trailing={<Skeleton className="h-7 w-14 shrink-0 rounded-[10px]" />}
        />
      ))}
    </FamousShell>
  );
}
