import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one action of a phone detail page, pinned to the bottom (docs/design: M-Food, M-Place). While it
 * is on screen it replaces the floating nav (globals.css hides the nav next to `data-page-cta`);
 * desktop shows the same action inside the page instead.
 */
export function StickyCta({
  href,
  children,
  chip,
}: {
  href: string;
  children: ReactNode;
  /** Reward chip, e.g. "+১০". */
  chip?: ReactNode;
}) {
  return (
    <div
      data-page-cta
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md lg:hidden"
    >
      <Link
        href={href}
        className="flex h-[58px] press items-center justify-center gap-2.5 rounded-full bg-primary bg-grad-action px-5 text-[17px] font-semibold text-primary-foreground shadow-floating"
      >
        {children}
        {chip ? (
          <span className="flex h-[26px] items-center rounded-full bg-reward px-2.5 text-[13px] font-bold text-reward-foreground">
            {chip}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
