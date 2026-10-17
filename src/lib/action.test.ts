import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import type { AppUser } from "@/core/domain";
import { AuthRequiredError, type AuthProvider, type RateLimiter } from "@/core/ports";

import { createDefineAction } from "./action";
import { fail, ok } from "./result";

const user: AppUser = {
  id: "u1",
  displayName: "টেস্ট",
  avatarUrl: null,
  role: "user",
  homeDistrictId: null,
  isBanned: false,
  pointsTotal: 0,
};

function setup({
  signedIn = true,
  banned = false,
  allowed = true,
  role = "user" as AppUser["role"],
} = {}) {
  const auth: AuthProvider = {
    getSession: async () => null,
    requireUser: async () => {
      if (!signedIn) throw new AuthRequiredError();
      return { ...user, role, isBanned: banned };
    },
    signInUrl: async () => "",
    completeSignIn: async () => true,
    signOut: async () => {},
  };
  const consume = vi.fn<RateLimiter["consume"]>(async () =>
    allowed ? { allowed: true } : { allowed: false, retryAfter: 60 },
  );
  const report = vi.fn();
  const defineAction = createDefineAction({
    auth: () => auth,
    rateLimiter: () => ({ consume }),
    errors: () => ({ report }),
    services: () => ({ greeting: "hi" }),
  });
  return { defineAction, consume, report };
}

const schema = z.object({ name: z.string().min(2) });

describe("defineAction", () => {
  it("returns validation errors per field without calling the handler", async () => {
    const { defineAction } = setup();
    const handler = vi.fn();
    const action = defineAction(schema, handler);
    expect(await action({ name: "x" })).toEqual({
      ok: false,
      error: { code: "validation", fields: { name: expect.any(String) } },
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("runs public actions without a user", async () => {
    const { defineAction } = setup({ signedIn: false });
    const action = defineAction(schema, async (input, { user: current }) =>
      ok({ name: input.name, signedIn: current !== null }),
    );
    expect(await action({ name: "দই" })).toEqual({
      ok: true,
      data: { name: "দই", signedIn: false },
    });
  });

  it("asks for login when auth is required", async () => {
    const { defineAction } = setup({ signedIn: false });
    const action = defineAction(schema, async () => ok(1), { auth: true });
    expect(await action({ name: "দই" })).toEqual({ ok: false, error: { code: "auth_required" } });
  });

  it("blocks banned users", async () => {
    const { defineAction } = setup({ banned: true });
    const action = defineAction(schema, async () => ok(1), { auth: true });
    expect(await action({ name: "দই" })).toEqual({ ok: false, error: { code: "forbidden" } });
  });

  it("applies the daily limit for the action", async () => {
    const { defineAction, consume } = setup({ allowed: false });
    const action = defineAction(schema, async () => ok(1), { auth: true, rateLimit: "experience" });
    expect(await action({ name: "দই" })).toEqual({
      ok: false,
      error: { code: "rate_limited", retryAfter: 60 },
    });
    expect(consume).toHaveBeenCalledWith("u1", "experience");
  });

  it("passes the user and services to the handler and returns its Result", async () => {
    const { defineAction } = setup();
    const action = defineAction(
      schema,
      async (input, { user: current, services }) =>
        ok(`${services.greeting} ${current.id} ${input.name}`),
      { auth: true },
    );
    expect(await action({ name: "দই" })).toEqual({ ok: true, data: "hi u1 দই" });
  });

  it("passes domain failures through", async () => {
    const { defineAction } = setup();
    const action = defineAction(schema, async () => fail("not_found"));
    expect(await action({ name: "দই" })).toEqual({ ok: false, error: { code: "not_found" } });
  });

  it("reports unexpected errors and never throws to the client", async () => {
    const { defineAction, report } = setup();
    const boom = new Error("db down");
    const action = defineAction(schema, async () => {
      throw boom;
    });
    expect(await action({ name: "দই" })).toEqual({ ok: false, error: { code: "unknown" } });
    expect(report).toHaveBeenCalledWith(boom, expect.any(Object));
  });

  it("lets only admins through when the action asks for the admin role", async () => {
    const handler = vi.fn(async () => ok("done"));
    const asUser = setup().defineAction(schema, handler, { auth: true, role: "admin" });
    expect(await asUser({ name: "দই" })).toEqual({ ok: false, error: { code: "forbidden" } });
    expect(handler).not.toHaveBeenCalled();
    const asAdmin = setup({ role: "admin" }).defineAction(schema, handler, {
      auth: true,
      role: "admin",
    });
    expect(await asAdmin({ name: "দই" })).toEqual({ ok: true, data: "done" });
  });
});
