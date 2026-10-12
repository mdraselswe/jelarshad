import { MapPinIcon } from "lucide-react";
import Link from "next/link";

import { Band } from "@/components/layout/band";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import type { DistrictHeader } from "@/services/catalog-service";

/** The neighbourhoods of a big district (ধানমন্ডি in ঢাকা): each opens its own page. Hidden when none. */
export function DistrictAreasSection({ district }: { district: DistrictHeader }) {
  const t = getT();
  if (district.areas.length === 0) return null;
  return (
    <Band tone="mint" title={t("district.areasTitle")} icon={<MapPinIcon />}>
      <ul className="flex rise-children flex-wrap gap-2.5">
        {district.areas.map((area) => (
          <li key={area.slug}>
            <Link
              href={routes.area(district.slug, area.slug)}
              className="flex h-11 press items-center rounded-full border border-border bg-card px-4 text-[15px] font-medium"
            >
              {area.nameBn}
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  );
}
