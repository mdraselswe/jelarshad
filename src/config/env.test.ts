import { describe, expect, it } from "vitest";

import { parseClientEnv, parseServerEnv } from "./env";

const supabase = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
};

describe("parseClientEnv", () => {
  it("runs with no configuration on mocks, not launched, Bangla", () => {
    expect(parseClientEnv({})).toMatchObject({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_LAUNCHED: false,
      NEXT_PUBLIC_DEFAULT_LOCALE: "bn",
      NEXT_PUBLIC_STORAGE_PROVIDER: "mock",
    });
  });

  it("parses the launch flag as a boolean", () => {
    expect(parseClientEnv({ NEXT_PUBLIC_LAUNCHED: "true" }).NEXT_PUBLIC_LAUNCHED).toBe(true);
    expect(parseClientEnv({ NEXT_PUBLIC_LAUNCHED: "false" }).NEXT_PUBLIC_LAUNCHED).toBe(false);
    expect(() => parseClientEnv({ NEXT_PUBLIC_LAUNCHED: "yes please" })).toThrow();
  });

  it("falls back to the Vercel branch URL on previews", () => {
    expect(
      parseClientEnv({ NEXT_PUBLIC_VERCEL_BRANCH_URL: "jelarshad-git-x.vercel.app" })
        .NEXT_PUBLIC_SITE_URL,
    ).toBe("https://jelarshad-git-x.vercel.app");
  });

  it("rejects an invalid site URL", () => {
    expect(() => parseClientEnv({ NEXT_PUBLIC_SITE_URL: "jelarshad.example" })).toThrow();
  });

  it("requires the cloud name when storage is cloudinary", () => {
    expect(() => parseClientEnv({ NEXT_PUBLIC_STORAGE_PROVIDER: "cloudinary" })).toThrow(
      /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME/,
    );
  });
});

describe("parseServerEnv", () => {
  it("defaults every provider to a no-account option", () => {
    expect(parseServerEnv({})).toMatchObject({
      DB_PROVIDER: "mock",
      AUTH_PROVIDER: "mock",
      ANALYTICS_PROVIDER: "first-party",
      ADMIN_EMAILS: [],
    });
  });

  it("requires Supabase keys when Supabase is selected", () => {
    expect(() => parseServerEnv({ DB_PROVIDER: "supabase" })).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(
      parseServerEnv({ DB_PROVIDER: "supabase", AUTH_PROVIDER: "supabase", ...supabase }),
    ).toMatchObject({ DB_PROVIDER: "supabase" });
  });

  it("requires Cloudinary server keys when Cloudinary is selected", () => {
    expect(() =>
      parseServerEnv({
        NEXT_PUBLIC_STORAGE_PROVIDER: "cloudinary",
        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: "demo",
      }),
    ).toThrow(/CLOUDINARY_API_SECRET/);
  });

  it("normalizes the admin email list", () => {
    expect(
      parseServerEnv({ ADMIN_EMAILS: " A@Example.com, b@example.com ,," }).ADMIN_EMAILS,
    ).toEqual(["a@example.com", "b@example.com"]);
    expect(() => parseServerEnv({ ADMIN_EMAILS: "not-an-email" })).toThrow();
  });

  it("treats empty values as unset (vercel pull writes empty system vars)", () => {
    const env = parseServerEnv({
      VERCEL_GIT_COMMIT_SHA: "",
      NEXT_PUBLIC_SITE_URL: "",
      PREVIEW_ACCESS_SECRET: "  ",
      DB_PROVIDER: "",
    });
    expect(env.VERCEL_GIT_COMMIT_SHA).toBeUndefined();
    expect(env.PREVIEW_ACCESS_SECRET).toBeUndefined();
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect(env.DB_PROVIDER).toBe("mock");
  });

  it("refuses mock providers on a launched production deploy", () => {
    expect(() =>
      parseServerEnv({ VERCEL_ENV: "production", NEXT_PUBLIC_LAUNCHED: "true" }),
    ).toThrow(/Cannot be mock/);
    // Pre-launch production (coming-soon page) may still run on mocks.
    expect(parseServerEnv({ VERCEL_ENV: "production" }).DB_PROVIDER).toBe("mock");
  });

  it("treats Vercel's [SENSITIVE] placeholders as hidden while building, never otherwise", () => {
    const pulled = {
      DB_PROVIDER: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
      AUTH_PROVIDER: '"[SENSITIVE]"',
      SUPABASE_SERVICE_ROLE_KEY: '"[SENSITIVE]"',
      ADMIN_EMAILS: '"[SENSITIVE]"',
    };
    expect(() => parseServerEnv({ ...pulled, NEXT_PHASE: "phase-production-build" })).not.toThrow();
    // at runtime a placeholder is a mistake, not a value
    expect(() => parseServerEnv(pulled)).toThrow();
  });
});
