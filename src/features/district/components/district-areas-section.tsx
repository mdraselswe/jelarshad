import { MapPinIcon } from "lucide-react";
import Link from "next/link";

import { Band } from "@/components/layout/band";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import type { DistrictHeader } from "@/services/catalog-service";

const NAME_COLORS = [
  "text-primary-text",
  "text-cat-pink-fg",
  "text-cat-green-fg",
  "text-cat-coral-fg",
  "text-cat-violet-fg",
] as const;

/** The neighbourhoods of a big district (ধানমন্ডি in ঢাকা): each opens its own page. Hidden when none. */
export function DistrictAreasSection({ district }: { district: DistrictHeader }) {
  const t = getT();
  if (district.areas.length === 0) return null;
  return (
    <Band tone="warm" title={t("district.areasTitle")} icon={<MapPinIcon />}>
      <ul className="flex rise-children flex-wrap gap-2">
        {district.areas.map((area, index) => (
          <li key={area.slug}>
            <Link
              href={routes.area(district.slug, area.slug)}
              className={cn(
                "flex h-11 press items-center rounded-[16px] bg-card px-3.5 text-[14px] font-semibold shadow-card",
                NAME_COLORS[index % NAME_COLORS.length],
              )}
            >
              {area.nameBn}
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  );
}
