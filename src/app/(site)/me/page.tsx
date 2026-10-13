import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { LoginGate } from "@/features/auth/components/login-gate";
import { MePage } from "@/features/me/components/me-page";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

// Personal page: never indexed.
export const metadata: Metadata = buildMetadata({
  title: getT()("nav.passport"),
  description: getT()("auth.loginBody"),
  path: "/me",
  noindex: true,
});

export default function Me() {
  return <LoginGate next={routes.me()}>{(user) => <MePage user={user} />}</LoginGate>;
}
