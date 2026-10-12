import { HeartIcon } from "lucide-react";
import Link from "next/link";

import { Band } from "@/components/layout/band";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { tileClass } from "@/lib/tone";
import type { DistrictHeader } from "@/services/catalog-service";

/**
 * The editors' "famous for" list as gradient tiles (docs/design: M-District); each opens the
 * district×food page. Hidden when empty.
 */
export function DistrictFamousSection({ district }: { district: DistrictHeader }) {
  const t = getT();
  if (district.famous.length === 0) return null;
  return (
    <Band
      tone="warm"
      title={t("district.famous")}
      icon={<HeartIcon />}
      gap={false}
      className="mt-6"
    >
      <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("home.famousHint")}</p>
      <ul className="grid rise-children grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {district.famous.map(({ food, noteBn }) => (
          <li key={food.slug}>
            <Link
              href={routes.districtFood(district.slug, food.slug)}
              className={cn(
                "flex min-h-[120px] flex-col justify-between rounded-card-lg p-4 text-on-hero lg:min-h-[150px] lg:p-5",
                tileClass(food.slug),
                "lift press",
              )}
            >
              <span
                aria-hidden
                className="flex size-11 items-center justify-center rounded-[15px] bg-white/22 font-display text-[22px] font-bold"
              >
                {food.nameBn.slice(0, 1)}
              </span>
              <span>
                <span className="block font-display text-[20px] leading-tight font-bold">
                  {food.nameBn}
                </span>
                {noteBn ? <span className="block text-[12.5px] opacity-95">{noteBn}</span> : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Band>
  );
}
