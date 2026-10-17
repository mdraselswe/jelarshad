// Reports server-side render errors (a page or route that threw) to our own error log, which the
// admin pages list. Runs once per request error; the client-side boundaries report their own.
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routePath: string; routeType: string },
) {
  // The runtime flag is set by Next itself and is not part of our env schema.
  // eslint-disable-next-line no-restricted-properties
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getServices } = await import("@/infrastructure/container");
  getServices().errors.report(error, {
    route: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
}
