/** Hosts the app used to be served from (before the move to its own address). */
export const LEGACY_HOSTS: readonly string[] = ["shojashapta.com", "www.shojashapta.com"];

/**
 * Where a request that arrived on an old host should go, or null when it should be served as is.
 * It only redirects once NEXT_PUBLIC_SITE_URL points at another host, so nothing moves before the
 * new address is switched on.
 */
export function legacyHostRedirect(input: {
  requestHost: string;
  siteUrl: string;
  pathname: string;
  search: string;
}): string | null {
  const requestHost = input.requestHost.toLowerCase().replace(/:\d+$/, "");
  if (!LEGACY_HOSTS.includes(requestHost)) return null;
  let site: URL;
  try {
    site = new URL(input.siteUrl);
  } catch {
    return null;
  }
  if (site.hostname === requestHost || LEGACY_HOSTS.includes(site.hostname)) return null;
  return `${site.origin}${input.pathname}${input.search}`;
}
