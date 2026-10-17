import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

import { serverEnv } from "@/config/env";
import type { AppUser, Session } from "@/core/domain";
import { AuthRequiredError, type AuthProvider } from "@/core/ports";

import { createSupabaseClients } from "./client.server";
import type { Database } from "./database.types";

// Google sign-in with Supabase Auth (docs/03-architecture.md §4). The session lives in Supabase's
// cookies (PKCE flow); every request validates it with `getUser()`, never by trusting the cookie.

async function userClient() {
  const env = serverEnv();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "Supabase auth needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  const store = await cookies();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          try {
            for (const { name, value, options } of list) store.set(name, value, options);
          } catch {
            // Server Components cannot write cookies; proxy.ts refreshes the session instead.
          }
        },
      },
    },
  );
}

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toAppUser(profile: ProfileRow): AppUser {
  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    role: profile.role,
    homeDistrictId: profile.home_district_id,
    isBanned: profile.is_banned,
    pointsTotal: profile.points_total,
  };
}

/** One lookup per request, however many components ask. */
const loadSession = cache(async (): Promise<Session | null> => {
  const supabase = await userClient();
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;
  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (!profile) return null;

  // Admin bootstrap (docs/09): the owner's email in ADMIN_EMAILS becomes an admin on first sight.
  // Only the service role may change `role`; a verified email is required.
  let row = profile;
  const email = authUser.email?.toLowerCase();
  if (
    email &&
    authUser.email_confirmed_at &&
    serverEnv().ADMIN_EMAILS.includes(email) &&
    profile.role !== "admin"
  ) {
    const service = createSupabaseClients().service;
    if (service) {
      const { data: updated } = await service
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", profile.id)
        .select("*")
        .maybeSingle();
      if (updated) row = updated;
    }
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const expiresAt = sessionData.session?.expires_at
    ? new Date(sessionData.session.expires_at * 1000)
    : new Date(Date.now() + 60 * 60 * 1000);
  return { user: toAppUser(row), expiresAt };
});

export function createSupabaseAuth(): AuthProvider {
  return {
    getSession: loadSession,
    async requireUser() {
      const session = await loadSession();
      if (!session) throw new AuthRequiredError();
      return session.user;
    },
    async signInUrl(provider, redirectTo) {
      const supabase = await userClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) throw error ?? new Error("Supabase returned no sign-in URL");
      return data.url;
    },
    async completeSignIn(code) {
      if (!code) return false;
      const supabase = await userClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      return !error;
    },
    async signOut() {
      const supabase = await userClient();
      await supabase.auth.signOut();
    },
  };
}
