import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";

// Bangladesh has no daylight saving: UTC+6 all year.
function daypart(now: Date) {
  const hour = (now.getUTCHours() + 6) % 24;
  if (hour >= 5 && hour < 12) return "morning" as const;
  if (hour < 15) return "noon" as const;
  if (hour < 18) return "afternoon" as const;
  if (hour < 21) return "evening" as const;
  return "night" as const;
}

/** A signed-in visitor's first name on the hero, by time of day. Nothing for everyone else. */
export async function HomeGreeting() {
  const session = await getServices().auth.getSession();
  if (!session) return null;
  const t = getT();
  const name = session.user.displayName.trim().split(/s+/)[0] ?? "";
  if (name === "") return null;
  return (
    <span className="inline-block rounded-[12px] bg-white/20 px-2.5 py-1 text-[12.5px] leading-tight font-semibold">
      {t(`home.greeting.${daypart(new Date())}`, { name })}
    </span>
  );
}
