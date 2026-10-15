import { StoreIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

import { getPlaceBranches } from "../queries";

/** Other branches of the same chain; each is its own place. Nothing (and no space) when there are none. */
export async function PlaceBranchesSection({ placeId }: { placeId: string }) {
  const t = getT();
  const branches = await getPlaceBranches(placeId);
  if (!branches) return null;
  return (
    <Section
      title={t("place.branchesTitle", { brand: branches.brandNameBn })}
      icon={<StoreIcon />}
      tone="violet"
    >
      <GroupedList split>
        {branches.items.map((branch) => (
          <ListRow
            key={branch.slug}
            href={routes.place(branch.slug)}
            leading={<ListTile tone="place">{branch.nameBn.slice(0, 1)}</ListTile>}
            title={branch.nameBn}
            meta={branch.areaNameBn}
          />
        ))}
      </GroupedList>
      <p className="mt-3 text-meta text-muted-foreground">{t("place.branchesNote")}</p>
    </Section>
  );
}
