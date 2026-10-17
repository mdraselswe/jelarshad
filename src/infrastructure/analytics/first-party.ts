import type { AnalyticsEvent, AnalyticsProvider, InsightRepository } from "@/core/ports";

/** The event's small properties, without its name. */
function propsOf(event: AnalyticsEvent): Record<string, string | number | boolean | null> {
  const { name: _name, ...rest } = event;
  return rest;
}

/**
 * ANALYTICS_PROVIDER=first-party (default): events go to our own database, with no cookie, IP or user
 * id. Fire and forget: counting must never slow down or break the thing being counted.
 */
export function createFirstPartyAnalytics(insights: InsightRepository): AnalyticsProvider {
  return {
    track(event) {
      void insights
        .record({
          name: event.name,
          path: event.name === "share" ? event.path : null,
          props: propsOf(event),
        })
        .catch(() => {});
    },
  };
}
