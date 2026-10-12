import type { ErrorReporter } from "@/core/ports";

/** MVP error reporting: console → Vercel logs (docs/02-tech-stack.md §3). */
export const consoleErrorReporter: ErrorReporter = {
  report(error, context) {
    console.error("[jelarshad]", error, context ?? {});
  },
};
