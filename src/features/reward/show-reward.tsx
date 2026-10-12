"use client";

import { toast } from "@/lib/toast";

import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format/number";
import { announceMoment } from "@/lib/reward-moment";
import type { Reward } from "@/services/reward-service";

type Translate = ReturnType<typeof useT>;

/** One line for what a reward unlocked ("বগুড়া আনলক হয়েছে"), or null when it only paid points. */
export function stampText(t: Translate, reward: Reward): string | null {
  const stamp = reward.newStamps[0];
  if (!stamp) return null;
  return t(stamp.kind === "discoverer" ? "reward.discoverer" : "reward.stampUnlocked", {
    district: stamp.districtName,
  });
}

/**
 * The gold "+১০" toast (docs/design/C-Food): dark text on the reward gradient, readable in both
 * themes. With nothing earned it falls back to a plain
 * confirmation, so a repeat action still says that it worked.
 */
export function showReward(t: Translate, reward: Reward, plain: string) {
  const bonus = reward.missions?.reduce((sum, mission) => sum + mission.bonus, 0) ?? 0;
  if (reward.points <= 0 && reward.newStamps.length === 0 && bonus === 0 && !reward.levelUp) {
    toast.success(plain);
    return;
  }
  // A new level or stamp is celebrated full screen; everything else is a quick gold toast.
  const newStamp = reward.newStamps[0];
  if (reward.levelUp || newStamp) {
    announceMoment({
      points: reward.points,
      bonus,
      level: reward.levelUp?.level ?? null,
      stamp: newStamp ? { districtName: newStamp.districtName, kind: newStamp.kind } : null,
      plain,
    });
    return;
  }
  const stamp = stampText(t, reward);
  toast.custom(() => (
    <div
      role="status"
      className="flex w-full items-center gap-3 rounded-card-lg bg-grad-reward p-3.5 text-on-reward shadow-toast"
    >
      {reward.points + bonus > 0 && (
        <span className="flex h-10 shrink-0 items-center rounded-full bg-on-reward px-3 font-display text-[17px] font-bold text-reward-soft">
          +{formatNumber(reward.points + bonus)}
        </span>
      )}
      <span className="text-[15px] leading-snug">
        <b className="block">{stamp ?? plain}</b>
        {stamp ? <span className="font-medium">{plain}</span> : null}
      </span>
    </div>
  ));
}
