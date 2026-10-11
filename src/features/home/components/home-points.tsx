import Link from "next/link";

import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";

/**
 * The signed-in visitor's points as a gold-dot chip (top of the home hero on phones, in the top bar
 * on desktop). Nothing for everyone else. Reads cookies, so it sits behind Suspense.
 */
export async function HomePoints({ className }: { className?: string }) {
  const session = await getServices().auth.getSession();
  if (!session) return null;
  const { points } = await getServices().rewards.summary(session.user.id);
  const t = getT();
  return (
    <Link
      href={routes.me()}
      aria-label={t("reward.pointsChip", { count: formatNumber(points) })}
      className={cn(
        "flex h-10 press items-center gap-2 rounded-full px-3.5 text-sm font-semibold",
        className,
      )}
    >
      <span aria-hidden className="size-5 rounded-full bg-reward" />
      {formatNumber(points)}
    </Link>
  );
}
