import { UtensilsIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { DistrictHeader } from "@/services/catalog-service";

/** The editors' "famous for" list; each row opens the district×food page. Hidden when empty. */
export function DistrictFamousSection({ district }: { district: DistrictHeader }) {
  const t = getT();
  if (district.famous.length === 0) return null;
  return (
    <Section title={t("district.famous")}>
      <GroupedList split>
        {district.famous.map(({ food, noteBn }) => (
          <ListRow
            key={food.slug}
            href={routes.districtFood(district.slug, food.slug)}
            leading={
              <ListTile tone="food">
                <UtensilsIcon />
              </ListTile>
            }
            title={food.nameBn}
            meta={
              noteBn ?? t("district.titleFood", { district: district.nameBn, food: food.nameBn })
            }
          />
        ))}
      </GroupedList>
    </Section>
  );
}
