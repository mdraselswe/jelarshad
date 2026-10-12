import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Header } from "./header";

type PageShellProps = {
  children: ReactNode;
  /** Defaults to the standard header (logo). Pass `null` for pages without one. */
  header?: ReactNode;
  className?: string;
};

/**
 * One mobile column for every app page. The bottom padding keeps the last content above the
 * floating bottom nav (66px + 16px gap + safe area).
 */
export function PageShell({ children, header, className }: PageShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col md:max-w-none lg:min-h-[calc(100dvh-72px)] lg:max-w-[1200px]">
      {header === undefined ? <Header /> : header}
      <main id="main" className={cn("flex flex-1 flex-col pb-6 lg:pb-12", className)}>
        {children}
      </main>
    </div>
  );
}
