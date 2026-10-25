"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { track } from "@/lib/analytics/client";

/** Counts one page view per route change, except the admin pages (the owner's own visits). */
export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname.startsWith("/admin")) track("page_view");
  }, [pathname]);
  return null;
}
