import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { LoginGate } from "@/features/auth/components/login-gate";
import { MeProfilePage, parseMeTab } from "@/features/me/components/me-page";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

// Personal page: never indexed.
export const metadata: Metadata = buildMetadata({
  title: getT()("auth.profileTitle"),
  description: getT()("auth.loginBody"),
  path: "/me/profile",
  noindex: true,
});

export default function Profile({ searchParams }: PageProps<"/me/profile">) {
  return (
    <LoginGate next={routes.profile()}>
      {async (user) => <MeProfilePage user={user} tab={parseMeTab((await searchParams).tab)} />}
    </LoginGate>
  );
}
