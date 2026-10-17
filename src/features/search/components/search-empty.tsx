import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { NotFoundArt } from "@/components/illustration/food-art";
import { PersonArt, TreeArt } from "@/components/illustration/world-art";
import { QUICK_SEARCHES } from "@/config/home";
import { routes } from "@/config/routes";
import { appConfig } from "@/config/app.config";
import { getT } from "@/i18n/server";
import { formatNumber } from "@/lib/format/number";

/**
 * "Nothing found" for a query: a live illustration, what happened, what to try, and the one action
 * that fills the gap (add it, with the XP it earns). Replaces the plain dashed box.
 */
export function SearchEmpty({
  q,
  suggestions = [],
}: {
  q: string;
  /** Names close to what was typed ("কাচ্চি" for "kacci"). */
  suggestions?: { nameBn: string }[];
}) {
  const t = getT();
  return (
    <section
      aria-label={t("search.empty", { q })}
      className="animate-rise rounded-[28px] border border-border bg-card px-5 py-6 text-center shadow-card"
    >
      <div className="relative mx-auto w-full max-w-[17rem]">
        <NotFoundArt className="mx-auto w-52" />
        <TreeArt className="absolute bottom-1 left-0 w-10" />
        <PersonArt shirt="c" className="absolute right-1 bottom-0 h-16 w-8" />
      </div>
      <h2 className="mt-2 font-display text-[22px] leading-tight font-bold">
        {t("search.empty", { q })}
      </h2>
      <p className="mt-1.5 text-meta text-muted-foreground">{t("search.emptyHint")}</p>

      {suggestions.length > 0 ? (
        <div className="mt-4">
          <p className="text-caption font-semibold text-muted-foreground">
            {t("search.didYouMean")}
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion.nameBn}>
                <Link
                  href={routes.search({ q: suggestion.nameBn })}
                  className="flex h-10 press items-center rounded-full bg-primary px-4 text-[14.5px] font-semibold text-primary-foreground"
                >
                  {suggestion.nameBn}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Link
        href={routes.add()}
        className="mt-5 inline-flex h-12 press items-center gap-2 rounded-full bg-grad-reward px-5 text-[15px] font-bold text-on-reward shadow-card"
      >
        <PlusIcon className="size-5" aria-hidden strokeWidth={2.6} />
        {t("search.addCta")}
        <span className="rounded-full bg-on-reward px-2 font-display text-[13px] text-reward-soft">
          +{formatNumber(appConfig.points.experience)}
        </span>
      </Link>
      <p className="mt-2 text-caption text-muted-foreground">{t("search.addHint")}</p>

      <div className="mt-5 border-t border-divider pt-4">
        <p className="text-caption font-semibold text-muted-foreground">{t("search.tryTitle")}</p>
        <ul className="mt-2.5 flex flex-wrap justify-center gap-2">
          {QUICK_SEARCHES.map((term) => (
            <li key={term}>
              <Link
                href={routes.search({ q: term })}
                className="flex h-10 press items-center rounded-full bg-primary-soft px-4 text-[14.5px] font-semibold text-primary-soft-fg"
              >
                {term}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
