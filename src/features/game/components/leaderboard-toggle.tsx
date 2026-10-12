"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";

import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

import { setLeaderboardOptIn } from "../actions";

/** The switch that puts the person's name on the weekly board. Optimistic; off by default. */
export function LeaderboardToggle({
  initial,
  className,
}: {
  initial: boolean;
  className?: string;
}) {
  const t = useT();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [on, setOn] = useOptimistic(initial, (_, next: boolean) => next);

  function toggle() {
    startTransition(async () => {
      setOn(!on);
      const result = await setLeaderboardOptIn({ optIn: !on });
      if (result.ok) {
        toast.success(t("game.boardSaved"));
        router.refresh();
        return;
      }
      toast.error(t(`errors.${result.error.code}`));
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className={cn(
        "flex w-full press items-center gap-3 rounded-[20px] bg-card p-3 text-left",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-card-title">{t("game.boardOptIn")}</span>
        <span className="block truncate text-meta text-muted-foreground">
          {t("game.boardOptInHint")}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors",
          on ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "size-6 rounded-full bg-card shadow-segment transition-transform",
            on && "translate-x-5",
          )}
        />
      </span>
    </button>
  );
}
