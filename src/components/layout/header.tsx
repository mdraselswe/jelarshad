import Link from "next/link";
import type { ReactNode } from "react";

import { LogoLockup } from "@/components/brand/logo";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type HeaderProps = {
  /** Left side; defaults to the logo linking home. Pages pass a back button here. */
  start?: ReactNode;
  /** Right side: page actions (share, more). */
  end?: ReactNode;
  className?: string;
};

/** Top bar of every app page (docs/design: 14px × 16px padding, actions as 44px round buttons). */
export function Header({ start, end, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "header-sticky flex min-h-18 items-center justify-between gap-3 px-4 py-3.5 md:px-6 lg:hidden",
        className,
      )}
    >
      {start ?? (
        <Link
          href={routes.home()}
          aria-label={siteConfig.name}
          className="-m-1 press rounded-xl p-1"
        >
          <LogoLockup className="h-8" />
        </Link>
      )}
      {end && <div className="flex items-center gap-2">{end}</div>}
    </header>
  );
}
