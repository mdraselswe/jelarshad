import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one action of a phone detail page, pinned to the bottom (docs/design/ Food): a gold 58px button
 * with a pulse. While it is on screen it replaces the floating nav (globals.css hides the nav next
 * to `data-page-cta`); desktop shows the same action inside the page instead.
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
      className="fixed inset-x-4 bottom-[max(1.125rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md lg:hidden"
    >
      <Link
        href={href}
        className="flex h-[58px] press animate-fx-pulse items-center justify-center gap-2.5 rounded-[20px] bg-grad-reward px-5 text-[16px] font-bold text-on-reward shadow-floating"
      >
        {children}
        {chip ? (
          <span className="flex h-[26px] items-center rounded-[11px] bg-white/55 px-2.5 text-[12.5px] font-bold text-on-reward">
            {chip}
          </span>
        ) : null}
      </Link>
    </div>
  );
}
