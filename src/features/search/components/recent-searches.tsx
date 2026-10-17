"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";

const KEY = "jelarshad-recent-searches";
const MAX = 6;

const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore needs a stable snapshot between changes.
let cached: { raw: string; list: string[] } = { raw: "", list: [] };
function snapshot(): string[] {
  const raw = (() => {
    try {
      return window.localStorage.getItem(KEY) ?? "[]";
    } catch {
      return "[]";
    }
  })();
  if (raw !== cached.raw) cached = { raw, list: read() };
  return cached.list;
}
const serverSnapshot = (): string[] => [];

/** Remembers a search that found something (on this device only), newest first. Renders nothing. */
export function RememberSearch({ q }: { q: string }) {
  useEffect(() => {
    try {
      const next = [q, ...read().filter((item) => item !== q)].slice(0, MAX);
      window.localStorage.setItem(KEY, JSON.stringify(next));
      listeners.forEach((listener) => listener());
    } catch {
      // Private mode: no history, nothing breaks.
    }
  }, [q]);
  return null;
}

/** The last few things this person searched for, as chips; nothing when there are none. */
export function RecentSearches() {
  const t = useT();
  const recent = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [cleared, setCleared] = useState(false);
  if (recent.length === 0 || cleared) return null;
  return (
    <section className="mt-5" aria-label={t("search.recent")}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-caption font-semibold text-muted-foreground">{t("search.recent")}</p>
        <button
          type="button"
          className="text-caption font-semibold text-primary-text"
          onClick={() => {
            try {
              window.localStorage.removeItem(KEY);
            } catch {
              // ignore
            }
            setCleared(true);
          }}
        >
          {t("search.recentClear")}
        </button>
      </div>
      <ul className="mt-2 flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1 lg:justify-center">
        {recent.map((term) => (
          <li key={term}>
            <Link
              href={routes.search({ q: term })}
              className="flex h-10 shrink-0 press items-center rounded-full border border-border bg-card px-4 text-[14.5px] font-semibold"
            >
              {term}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
