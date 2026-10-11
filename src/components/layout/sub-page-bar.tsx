import Link from "next/link";

import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

import { BackButton } from "./back-button";

export type Crumb = { label: string; href?: string };

/**
 * Top of a detail page. Phones and tablets get a round back button to the fixed parent; from 1024px
 * the breadcrumb takes over (docs/design/desktop). The current page is the last crumb, no link.
 */
export function SubPageBar({
  backHref,
  crumbs = [],
  actions,
  hideMobile = false,
}: {
  /** The phone row is drawn inside the hero band instead (HeroBar); only the breadcrumb remains. */
  hideMobile?: boolean;
  backHref: string;
  crumbs?: Crumb[];
  /** Round icon buttons (save, share); shown right of the back button or the breadcrumb. */
  actions?: React.ReactNode;
}) {
  const t = getT();
  return (
    <>
      <div
        className={`flex items-center gap-2 px-4 py-3 md:px-6 lg:hidden ${hideMobile ? "hidden" : ""}`}
      >
        <BackButton href={backHref} />
        {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
      </div>
      <nav
        aria-label={t("breadcrumb.label")}
        className="hidden items-center gap-2 page-x pt-7 text-meta text-muted-foreground lg:flex"
      >
        <Link href={routes.home()} className="text-primary-text">
          {t("nav.home")}
        </Link>
        {crumbs.map((crumb, index) => (
          <span key={`${index}-${crumb.label}`} className="flex items-center gap-2">
            <span aria-hidden>/</span>
            {crumb.href ? (
              <Link href={crumb.href} className="text-primary-text">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
        {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
      </nav>
    </>
  );
}
