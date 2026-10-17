"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics/client";

/** Counts one event when it appears (for example a search with its result count). Renders nothing. */
export function EventTracker({
  name,
  props,
}: {
  name: string;
  props?: Record<string, string | number | boolean | null>;
}) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    track(name, JSON.parse(key) as Record<string, string | number | boolean | null>);
  }, [name, key]);
  return null;
}
