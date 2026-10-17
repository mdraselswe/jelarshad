import webpush from "web-push";

import type { PushSender } from "@/services/push-service";

/** Sends Web Push messages signed with our key pair (VAPID). */
export function createWebPushSender(config: {
  publicKey: string;
  privateKey: string;
  subject: string;
}): PushSender {
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return {
    async send(subscription, message) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(message),
          { TTL: 6 * 60 * 60, urgency: "low" },
        );
        return "sent";
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        return status === 404 || status === 410 ? "gone" : "failed";
      }
    },
  };
}
