import { Section } from "@/components/layout/section";
import { getT } from "@/i18n/server";

import { getHomeData } from "../queries";
import { DistrictChip, DistrictChipSkeleton } from "./district-chip";

const ROW_CLASS =
  "rise-children -mx-5 flex snap-x scroll-px-5 gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0";
const SKELETON_CHIPS = 5;

function DistrictChipsShell({ children }: { children: React.ReactNode }) {
  const t = getT();
  return (
    <Section title={t("home.districtsTitle")}>
      <div className={ROW_CLASS}>{children}</div>
    </Section>
  );
}

export async function DistrictChipsSection() {
  const { famousDistricts } = await getHomeData();
  if (famousDistricts.length === 0) return null;
  return (
    <DistrictChipsShell>
      {famousDistricts.map((district) => (
        <DistrictChip key={district.slug} district={district} />
      ))}
    </DistrictChipsShell>
  );
}

export function DistrictChipsSectionSkeleton() {
  return (
    <DistrictChipsShell>
      {Array.from({ length: SKELETON_CHIPS }, (_, index) => (
        <DistrictChipSkeleton key={index} />
      ))}
    </DistrictChipsShell>
  );
}
