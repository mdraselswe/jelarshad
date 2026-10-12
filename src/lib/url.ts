import { siteConfig } from "@/config/site";

export { withSearchParams } from "./search-params";

/** Canonical absolute URL for a path ("/food/doi" → "https://jelarshad.shojashapta.com/food/doi"). */
export function absoluteUrl(path: string = "/"): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
