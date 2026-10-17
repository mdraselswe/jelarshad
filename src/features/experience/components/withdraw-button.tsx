"use client";

import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useT } from "@/i18n/client";
import { toast } from "@/lib/toast";

import { withdrawExperience } from "../actions";

/**
 * "সরান" beside one of my own experiences. Two steps, so a slip cannot remove it: the first tap asks,
 * the second removes. The list refreshes afterwards.
 */
export function WithdrawButton({ experienceId }: { experienceId: string }) {
  const t = useT();
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await withdrawExperience({ experienceId });
      if (result.ok) {
        toast.success(t("experience.withdrawn"));
        router.refresh();
        return;
      }
      setAsking(false);
      toast.error(t(`errors.${result.error.code}`));
    });
  }

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        aria-label={t("experience.withdraw")}
        className="mr-2 flex size-11 shrink-0 press items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
      >
        <Trash2Icon className="size-[18px]" aria-hidden />
      </button>
    );
  }
  return (
    <span className="mr-2 flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="h-9 press rounded-full bg-danger-soft px-3 text-[13px] font-semibold text-danger-fg disabled:opacity-60"
      >
        {t("experience.withdrawConfirm")}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setAsking(false)}
        className="h-9 press rounded-full border border-border px-3 text-[13px] font-semibold"
      >
        {t("experience.withdrawCancel")}
      </button>
    </span>
  );
}
