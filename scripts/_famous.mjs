import { readFileSync, writeFileSync } from "node:fs";
function edit(f, pairs) {
  let s = readFileSync(f, "utf8");
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(f + " missing " + a.slice(0, 60));
    s = s.replace(a, b);
  }
  writeFileSync(f, s);
}
edit("src/features/home/components/home-famous-list.tsx", [
  [
    `import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "@/components/layout/section";`,
    `import { HeartIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Panel } from "@/components/layout/panel";`,
  ],
  [
    `    <Section
      title={t("home.famousTitle")}
      action={
        <Link href={routes.search()} className="text-sm font-semibold text-primary-text">
          {t("home.seeAll")}
        </Link>
      }
    >
      <p className="-mt-1.5 mb-3 text-meta text-muted-foreground">{t("home.famousHint")}</p>
      <GroupedList>{children}</GroupedList>
    </Section>`,
    `    <Panel
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
    </Panel>`,
  ],
]);
edit("src/features/home/components/home-district-tiles.tsx", [
  [
    `import { Section } from "@/components/layout/section";`,
    `import { MapPinIcon } from "lucide-react";

import { RouteArt } from "@/components/illustration/food-art";
import { Band } from "@/components/layout/band";`,
  ],
  [
    `    <Section
      title={t("home.districtsTitle")}
      action={
        count === undefined ? undefined : (
          <span className="text-sm font-semibold text-primary-text">
            {t("home.districtCount", { count: formatNumber(count) })}
          </span>
        )
      }
    >
      <div className={ROW_CLASS}>{children}</div>
    </Section>`,
    `    <Band
      tone="warm"
      title={t("home.districtsTitle")}
      icon={<MapPinIcon />}
      action={
        count === undefined ? undefined : (
          <span className="text-sm font-semibold text-primary-text">
            {t("home.districtCount", { count: formatNumber(count) })}
          </span>
        )
      }
    >
      <RouteArt tone="gold" className="-mb-1 h-10 w-full" />
      <div className={ROW_CLASS}>{children}</div>
    </Band>`,
  ],
]);
edit("src/features/home/components/home-page.tsx", [
  [
    `import { HomePassport,
  HomePassportSkeleton,
} from "@/features/passport/components/passport-section";`,
    ``,
  ],
]);
