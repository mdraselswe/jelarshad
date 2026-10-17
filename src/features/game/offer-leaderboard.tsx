"use client";

import { toast } from "@/lib/toast";

import { useT } from "@/i18n/client";

import { setLeaderboardOptIn } from "./actions";

type Translate = ReturnType<typeof useT>;

const ASKED_KEY = "jelarshad-board-asked";
const DELAY_MS = 2800;

/**
 * Asks once, a moment after a person's earning action, whether their name may appear on the
 * contributors list (it is off by default, so the list would stay empty). Asked at most once per
 * browser; "not now" is final. Nothing is asked of a guest or of someone already on the list.
 */
export function offerLeaderboard(t: Translate) {
  let asked = true;
  try {
    asked = window.localStorage.getItem(ASKED_KEY) !== null;
  } catch {
    return;
  }
  if (asked) return;
  window.setTimeout(async () => {
    try {
      const response = await fetch("/api/viewer");
      if (!response.ok) return;
      const body = (await response.json()) as {
        userId: string | null;
        leaderboardOptIn: boolean | null;
      };
      if (!body.userId || body.leaderboardOptIn !== false) return;
      window.localStorage.setItem(ASKED_KEY, "1");
    } catch {
      return;
    }
    const close = (id: string | number) => import("sonner").then((mod) => mod.toast.dismiss(id));
    toast.custom(
      (id) => (
        <div
          role="status"
          className="flex w-full flex-col gap-3 rounded-card-lg border border-border bg-card p-4 text-foreground shadow-toast"
        >
          <p className="text-[15px] leading-snug font-semibold">{t("leaderboard.offerTitle")}</p>
          <p className="text-meta text-muted-foreground">{t("leaderboard.offerHint")}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="h-10 press rounded-full bg-primary px-4 text-[14px] font-semibold text-primary-foreground"
              onClick={async () => {
                void close(id);
                const result = await setLeaderboardOptIn({ optIn: true });
                if (result.ok) toast.success(t("game.boardSaved"));
              }}
            >
              {t("leaderboard.offerYes")}
            </button>
            <button
              type="button"
              className="h-10 press rounded-full border border-border px-4 text-[14px] font-semibold"
              onClick={() => void close(id)}
            >
              {t("leaderboard.offerNo")}
            </button>
          </div>
        </div>
      ),
      { duration: 12_000 },
    );
  }, DELAY_MS);
}
