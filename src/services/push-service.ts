import type { Repositories, PushSubscriptionRecord } from "@/core/ports";
import { fail, ok, type Result } from "@/lib/result";

import type { RewardService } from "./reward-service";

// Streak reminders (Web Push). A person allows them on a device; once a day, anyone whose streak is
// alive but who has not earned anything today gets one gentle nudge. Pure: ports and a sender only.

export type PushMessage = { title: string; body: string; url: string };

/** Sends one message to one device. "gone" means the device no longer exists (drop it). */
export interface PushSender {
  send(
    subscription: PushSubscriptionRecord,
    message: PushMessage,
  ): Promise<"sent" | "gone" | "failed">;
}

type Deps = {
  repos: Pick<Repositories, "push">;
  rewards: Pick<RewardService, "progress">;
  /** Null when reminders are not set up (no key pair): nothing is offered and nothing is sent. */
  sender: PushSender | null;
};

/** A streak this long or longer is worth a reminder; a one-day streak is not yet a habit. */
const MIN_STREAK = 2;
const MAX_DEVICES = 500;
const ENDPOINT_MAX = 1000;

export type ReminderRun = {
  skipped: boolean;
  devices: number;
  sent: number;
  removed: number;
};

export function createPushService({ repos, rewards, sender }: Deps) {
  return {
    get enabled() {
      return sender !== null;
    },

    async subscribe(
      userId: string,
      input: { endpoint: string; p256dh: string; auth: string },
    ): Promise<Result<{ saved: true }>> {
      if (sender === null) return fail("not_found");
      let url: URL;
      try {
        url = new URL(input.endpoint);
      } catch {
        return fail("validation", { fields: { endpoint: "invalid" } });
      }
      if (url.protocol !== "https:" || input.endpoint.length > ENDPOINT_MAX) {
        return fail("validation", { fields: { endpoint: "invalid" } });
      }
      if (!input.p256dh || !input.auth) return fail("validation", { fields: { keys: "required" } });
      await repos.push.save({ userId, ...input });
      return ok({ saved: true });
    },

    async unsubscribe(endpoint: string): Promise<Result<{ removed: true }>> {
      await repos.push.remove(endpoint);
      return ok({ removed: true });
    },

    /**
     * The daily run: for every device of a person whose streak is alive (at least two days) and who
     * has not earned anything today, send the reminder built by `message`. Devices the push service
     * reports as gone are removed.
     */
    async remindStreaks(
      message: (streak: number) => PushMessage,
      now: Date = new Date(),
    ): Promise<ReminderRun> {
      if (sender === null) return { skipped: true, devices: 0, sent: 0, removed: 0 };
      const devices = await repos.push.all(MAX_DEVICES);
      const byUser = new Map<string, PushSubscriptionRecord[]>();
      for (const device of devices)
        byUser.set(device.userId, [...(byUser.get(device.userId) ?? []), device]);

      let sent = 0;
      let removed = 0;
      for (const [userId, list] of byUser) {
        const { streak } = await rewards.progress(userId, now);
        if (streak.current < MIN_STREAK || streak.activeToday) continue;
        const text = message(streak.current);
        for (const device of list) {
          const result = await sender.send(device, text);
          if (result === "sent") sent += 1;
          if (result === "gone") {
            await repos.push.remove(device.endpoint);
            removed += 1;
          }
        }
      }
      return { skipped: false, devices: devices.length, sent, removed };
    },
  };
}

export type PushService = ReturnType<typeof createPushService>;
