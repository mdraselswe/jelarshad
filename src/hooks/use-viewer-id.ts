"use client";

import { useEffect, useState } from "react";

// One request per page load, shared by everything that asks.
let pending: Promise<string | null> | null = null;

function fetchViewerId(): Promise<string | null> {
  pending ??= fetch("/api/viewer")
    .then((response) => (response.ok ? response.json() : { userId: null }))
    .then((body: { userId?: string | null }) => body.userId ?? null)
    .catch(() => null);
  return pending;
}

/** The signed-in person's id once known; `undefined` while loading, `null` for a guest. */
export function useViewerId(): string | null | undefined {
  const [id, setId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    void fetchViewerId().then((value) => {
      if (!cancelled) setId(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return id;
}
