import { SearchIcon } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";

/**
 * Looks like the search box and opens the search page (docs/design/C-Home). Phase 2.2 swaps this
 * for the live SearchBox on the home page.
 */
export function SearchEntry({
  className,
  withButton = false,
}: {
  className?: string;
  /** A gradient "খুঁজুন" pill at the end (desktop hero). */
  withButton?: boolean;
}) {
  const t = getT();
  return (
    <Link
      href={routes.search()}
      className={cn(
        "flex h-14 press items-center gap-2.5 rounded-input border border-border bg-card px-4 text-base text-muted-foreground",
        className,
      )}
    >
      <SearchIcon className="size-[22px] shrink-0" aria-hidden />
      <span className="line-clamp-1 flex-1">{t("home.searchPlaceholder")}</span>
      {withButton ? (
        <span
          aria-hidden
          className="ml-auto hidden h-11 shrink-0 items-center rounded-full bg-primary bg-grad-action px-6 text-base font-semibold text-primary-foreground lg:flex"
        >
          {t("search.label")}
        </span>
      ) : null}
    </Link>
  );
}
