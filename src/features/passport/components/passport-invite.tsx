import Link from "next/link";

import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

import { PassportRing } from "./passport-ring";

/** The gold passport card for a visitor who is not signed in: what it is, and one button to start. */
export function PassportInvite({ total }: { total: number }) {
  const t = getT();
  return (
    <Link
      href={routes.login({ next: routes.me() })}
      className="block min-h-[172px] press rounded-card-lg bg-grad-reward p-4 text-on-reward shadow-card"
    >
      <span className="flex items-center gap-3.5">
        <PassportRing value={0} total={total} onReward />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold">{t("reward.passportTitle")}</span>
          <span className="block text-meta opacity-85">{t("reward.inviteHint")}</span>
        </span>
      </span>
      <span className="mt-3.5 flex h-11 items-center justify-center rounded-full bg-card px-4 text-sm font-semibold text-foreground">
        {t("reward.joinCta")}
      </span>
    </Link>
  );
}
