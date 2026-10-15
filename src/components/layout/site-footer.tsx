import { HeartIcon } from "lucide-react";
import Link from "next/link";

import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

const AUTHOR = { name: "Muhammad Rasel", url: "https://linkedin.com/in/mdraselswe" } as const;

/**
 * End of every app page: the about and privacy links and who built it (with a link to their LinkedIn).
 * It also holds the room the floating bottom nav needs, so the last line is never hidden behind it.
 */
export function SiteFooter() {
  const t = getT();
  return (
    <footer className="mx-auto w-full max-w-lg page-x pt-2 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:max-w-none lg:max-w-[1200px] lg:pb-10">
      <nav
        aria-label={t("legal.policyLink")}
        className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-meta"
      >
        <Link
          href={routes.leaderboard()}
          className="py-2 text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("leaderboard.navTitle")}
        </Link>
        <Link
          href={routes.about()}
          className="py-2 text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("legal.aboutLink")}
        </Link>
        <Link
          href={routes.policy()}
          className="py-2 text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("legal.policyLink")}
        </Link>
      </nav>
      {/* Centered on the screen; the icons and the name share one vertical center. */}
      <p className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 py-2.5 text-meta text-muted-foreground">
        <HeartIcon aria-hidden className="size-4 shrink-0 fill-cat-pink-fg stroke-cat-pink-fg" />
        <span>{t("footer.builtWith")}</span>
        <a
          href={AUTHOR.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t("footer.linkedin")}: ${AUTHOR.name}`}
          className="inline-flex items-center gap-1.5 font-semibold text-primary-text underline-offset-4 hover:underline"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-4 shrink-0 fill-current">
            <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.05c.53-1 1.84-2 3.8-2 4.06 0 4.8 2.67 4.8 6.14V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z" />
          </svg>
          <span>{AUTHOR.name}</span>
        </a>
      </p>
    </footer>
  );
}
