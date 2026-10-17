import type { ErrorReporter, InsightRepository } from "@/core/ports";

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error";

/** Server errors go to the console (Vercel logs) and to our own error table, where /admin shows them. */
export function createFirstPartyErrorReporter(insights: InsightRepository): ErrorReporter {
  return {
    report(error, context) {
      console.error("[jelarshad]", error, context ?? {});
      const path = typeof context?.route === "string" ? context.route : null;
      void insights
        .recordError({
          source: "server",
          message: messageOf(error),
          stack: error instanceof Error ? (error.stack ?? null) : null,
          path,
          context: context ?? {},
        })
        .catch(() => {});
    },
  };
}
