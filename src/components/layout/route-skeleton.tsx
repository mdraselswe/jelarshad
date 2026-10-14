"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type RouteSkeletonKind =
  | "home"
  | "search"
  | "food"
  | "place"
  | "district"
  | "districtFood"
  | "area"
  | "me"
  | "profile"
  | "add"
  | "login"
  | "legal"
  | "admin";

/** The kind of page a path belongs to. Dynamic segments may arrive as `[slug]` or as the value. */
export function skeletonKindFor(pathname: string): RouteSkeletonKind {
  const parts = pathname.split("/").filter(Boolean);
  const [first, second, third] = parts;
  if (parts.length === 0) return "home";
  if (first === "search") return "search";
  if (first === "food") return "food";
  if (first === "place") return "place";
  if (first === "district") {
    if (parts.length <= 2) return "district";
    return third === "area" && parts.length >= 4 ? "area" : "districtFood";
  }
  if (first === "me") return second === "profile" ? "profile" : "me";
  if (first === "add") return "add";
  if (first === "login") return "login";
  if (first === "about" || first === "policy") return "legal";
  if (first === "admin") return "admin";
  return "home";
}

/**
 * The route group's loading state. A static fallback would show the same page shape for every route
 * (the home page), so the page jumped as soon as its content arrived. All skeletons are rendered on the
 * server and passed in; this picks the one that belongs to the address being opened.
 */
export function RouteSkeleton({ variants }: { variants: Record<RouteSkeletonKind, ReactNode> }) {
  const pathname = usePathname();
  return <>{variants[skeletonKindFor(pathname)]}</>;
}
