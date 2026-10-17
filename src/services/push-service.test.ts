import { describe, expect, it, vi } from "vitest";

import { createMockRepositories } from "@/infrastructure/mock/repositories";

import { createPushService, type PushMessage, type PushSender } from "./push-service";

const message = (streak: number): PushMessage => ({
  title: "ধারা",
  body: `${streak} দিন`,
  url: "/",
});

const device = (userId: string, n = 1) => ({
  userId,
  endpoint: `https://push.example/${userId}-${n}`,
  p256dh: "key",
  auth: "auth",
});

type Streak = { current: number; best: number; activeToday: boolean };

function setup(streaks: Record<string, Streak>, outcome: "sent" | "gone" | "failed" = "sent") {
  const repos = createMockRepositories();
  const send = vi.fn(async () => outcome);
  const sender: PushSender = { send };
  const rewards = {
    progress: async (userId: string) => ({ streak: streaks[userId] }),
  };
  const service = createPushService({
    repos,
    rewards: rewards as never,
    sender,
  });
  return { repos, send, service };
}

describe("pushService.subscribe", () => {
  it("saves a device, and the same endpoint again only updates it", async () => {
    const { repos, service } = setup({});
    const one = device("u1");
    expect(await service.subscribe(one.userId, one)).toEqual({ ok: true, data: { saved: true } });
    await service.subscribe(one.userId, one);
    expect(await repos.push.all(10)).toHaveLength(1);
  });

  it("refuses an address that is not https, and missing keys", async () => {
    const { service } = setup({});
    const bad = { ...device("u1"), endpoint: "http://push.example/x" };
    expect(await service.subscribe("u1", bad)).toMatchObject({ ok: false });
    expect(await service.subscribe("u1", { ...device("u1"), auth: "" })).toMatchObject({
      ok: false,
    });
    expect(await service.subscribe("u1", { ...device("u1"), endpoint: "nope" })).toMatchObject({
      ok: false,
    });
  });

  it("is switched off when there is no key pair", async () => {
    const repos = createMockRepositories();
    const off = createPushService({
      repos,
      rewards: { progress: async () => ({}) } as never,
      sender: null,
    });
    expect(off.enabled).toBe(false);
    expect(await off.subscribe("u1", device("u1"))).toMatchObject({ ok: false });
    expect(await off.remindStreaks(message)).toEqual({
      skipped: true,
      devices: 0,
      sent: 0,
      removed: 0,
    });
  });
});

describe("pushService.remindStreaks", () => {
  it("reminds people whose streak is alive but who have not earned today", async () => {
    const { repos, send, service } = setup({
      alive: { current: 4, best: 4, activeToday: false },
      done: { current: 5, best: 5, activeToday: true },
      young: { current: 1, best: 1, activeToday: false },
    });
    for (const user of ["alive", "done", "young"]) await repos.push.save(device(user));
    await repos.push.save(device("alive", 2));
    const run = await service.remindStreaks(message);
    expect(run).toEqual({ skipped: false, devices: 4, sent: 2, removed: 0 });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ userId: "alive" }), {
      title: "ধারা",
      body: "4 দিন",
      url: "/",
    });
  });

  it("drops a device the push service says is gone", async () => {
    const { repos, service } = setup(
      { alive: { current: 3, best: 3, activeToday: false } },
      "gone",
    );
    await repos.push.save(device("alive"));
    const run = await service.remindStreaks(message);
    expect(run).toMatchObject({ sent: 0, removed: 1 });
    expect(await repos.push.all(10)).toEqual([]);
  });

  it("keeps a device whose send merely failed", async () => {
    const { repos, service } = setup(
      { alive: { current: 3, best: 3, activeToday: false } },
      "failed",
    );
    await repos.push.save(device("alive"));
    expect(await service.remindStreaks(message)).toMatchObject({ sent: 0, removed: 0 });
    expect(await repos.push.all(10)).toHaveLength(1);
  });
});
