import { describe, expect, it } from "vitest";

import { legacyHostRedirect } from "./legacy-host";

const NEW_SITE = "https://jelarshad.shojashapta.com";

describe("legacyHostRedirect", () => {
  it("sends the old host to the new address, keeping path and query", () => {
    expect(
      legacyHostRedirect({
        requestHost: "shojashapta.com",
        siteUrl: NEW_SITE,
        pathname: "/food/doi",
        search: "?x=1",
      }),
    ).toBe("https://jelarshad.shojashapta.com/food/doi?x=1");
    expect(
      legacyHostRedirect({
        requestHost: "www.shojashapta.com",
        siteUrl: NEW_SITE,
        pathname: "/",
        search: "",
      }),
    ).toBe("https://jelarshad.shojashapta.com/");
  });

  it("does nothing while the site address is still the old host", () => {
    expect(
      legacyHostRedirect({
        requestHost: "shojashapta.com",
        siteUrl: "https://shojashapta.com",
        pathname: "/",
        search: "",
      }),
    ).toBeNull();
    expect(
      legacyHostRedirect({
        requestHost: "www.shojashapta.com",
        siteUrl: "https://shojashapta.com",
        pathname: "/",
        search: "",
      }),
    ).toBeNull();
  });

  it("leaves the new host, previews and localhost alone", () => {
    for (const requestHost of [
      "jelarshad.shojashapta.com",
      "x-git-y.vercel.app",
      "localhost:3000",
    ]) {
      expect(
        legacyHostRedirect({ requestHost, siteUrl: NEW_SITE, pathname: "/", search: "" }),
      ).toBeNull();
    }
  });
});
