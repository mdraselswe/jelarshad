import { describe, expect, it } from "vitest";

import { createMockRepositories } from "@/infrastructure/mock/repositories";

import { createFirstPartyErrorReporter } from "../errors/first-party";
import { createFirstPartyAnalytics } from "./first-party";

const DAY = 86_400_000;

describe("first-party usage counts", () => {
  it("counts events by name with distinct sessions, most events first", async () => {
    const { insights } = createMockRepositories();
    await insights.record({ name: "page_view", session: "a" });
    await insights.record({ name: "page_view", session: "a" });
    await insights.record({ name: "page_view", session: "b" });
    await insights.record({ name: "share", session: "a" });
    const summary = await insights.summary(new Date(Date.now() - DAY));
    expect(summary).toEqual([
      { name: "page_view", events: 3, sessions: 2 },
      { name: "share", events: 1, sessions: 1 },
    ]);
  });

  it("lists the most searched words and how many found nothing", async () => {
    const { insights } = createMockRepositories();
    for (const results of [0, 3, 0]) {
      await insights.record({ name: "search", props: { query: "Pizza", results } });
    }
    await insights.record({ name: "search", props: { query: "doi", results: 5 } });
    const top = await insights.topSearches(new Date(Date.now() - DAY), 5);
    expect(top).toEqual([
      { query: "pizza", searches: 3, empty: 2 },
      { query: "doi", searches: 1, empty: 0 },
    ]);
  });

  it("turns server events into rows without a person in them", async () => {
    const { insights } = createMockRepositories();
    createFirstPartyAnalytics(insights).track({ name: "experience_added", dishId: "d1" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    const [row] = await insights.summary(new Date(Date.now() - DAY));
    expect(row?.name).toBe("experience_added");
  });

  it("keeps server errors for the admin page", async () => {
    const { insights } = createMockRepositories();
    const quiet = console.error;
    console.error = () => {};
    try {
      createFirstPartyErrorReporter(insights).report(new Error("boom"), { route: "/place/x" });
    } finally {
      console.error = quiet;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    const [error] = await insights.recentErrors(5);
    expect(error).toMatchObject({ source: "server", message: "boom", path: "/place/x" });
  });

  it("purges rows older than the retention window", async () => {
    const { insights } = createMockRepositories();
    await insights.record({ name: "page_view" });
    // A window of -1 days puts the cut-off in the future, so the row just written counts as old.
    expect(await insights.purge(-1)).toBe(1);
    expect(await insights.summary(new Date(0))).toEqual([]);
  });
});
