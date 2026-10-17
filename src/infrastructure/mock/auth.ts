import "server-only";

import { cookies } from "next/headers";

import { AuthRequiredError, type AuthProvider } from "@/core/ports";

import { demoUser } from "./fixtures";

/** Cookie that marks a mock sign-in (AUTH_PROVIDER=mock: CI, e2e, offline work). */
export const MOCK_SESSION_COOKIE = "ss_mock_session";

/**
 * Pretend Google sign-in for local work and e2e: signed in as the fixture demo user while the
 * mock session cookie is set. Never selected when the app is launched in production (config/env).
 */
export function createMockAuth(): AuthProvider {
  // The cookie holds the demo user's id, with ":admin" appended after `?mock=admin` (e2e of /admin).
  const current = async () => {
    const value = (await cookies()).get(MOCK_SESSION_COOKIE)?.value;
    if (value === demoUser.id) return { ...demoUser };
    if (value === `${demoUser.id}:admin`) return { ...demoUser, role: "admin" as const };
    return null;
  };
  return {
    async getSession() {
      const user = await current();
      return user ? { user, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } : null;
    },
    async requireUser() {
      const user = await current();
      if (!user) throw new AuthRequiredError();
      return user;
    },
    async signInUrl(_provider, redirectTo) {
      // Skips the provider: the callback route sees `mock=1` and signs in the demo user.
      return `${redirectTo}${redirectTo.includes("?") ? "&" : "?"}mock=1`;
    },
    async completeSignIn(code) {
      if (code !== "1" && code !== "admin") return false;
      (await cookies()).set(
        MOCK_SESSION_COOKIE,
        code === "admin" ? `${demoUser.id}:admin` : demoUser.id,
        {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 24 * 60 * 60,
        },
      );
      return true;
    },
    async signOut() {
      (await cookies()).delete(MOCK_SESSION_COOKIE);
    },
  };
}
