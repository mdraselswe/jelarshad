import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";

import type { SearchTab } from "../search-params";
import { TabPills } from "./tab-state";

type Counts = { all: number; food: number; place: number; district: number };

const TAB_IDS: SearchTab[] = ["all", "food", "place", "district"];

/** Tab pills with the number of hits in each; switching is instant (see tab-state.tsx). */
export function SearchTabs({
  q,
  counts,
  carry,
}: {
  q: string;
  counts: Counts;
  /** Filters kept when switching tabs. */
  carry: { type?: string | undefined; price?: string | undefined };
}) {
  const t = getT();
  return (
    <TabPills
      q={q}
      carry={carry}
      label={t("search.label")}
      pills={TAB_IDS.map((id) => ({
        id,
        label: t(`search.tabs.${id}`),
        count: formatNumber(counts[id]),
      }))}
    />
  );
}
