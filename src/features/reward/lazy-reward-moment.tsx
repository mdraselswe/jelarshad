"use client";

import dynamic from "next/dynamic";

// The celebration only appears after an action, so its code (dialog and confetti) is fetched after
// hydration instead of being part of every page's first scripts.
const RewardMoment = dynamic(() => import("./reward-moment").then((mod) => mod.RewardMoment), {
  ssr: false,
});

export function LazyRewardMoment() {
  return <RewardMoment />;
}
