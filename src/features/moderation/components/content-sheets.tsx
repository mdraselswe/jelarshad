"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "@/lib/toast";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/t";
import { cn } from "@/lib/cn";

import { reportContent, suggestEdit } from "../actions";

export type Target = { entity: "place" | "food"; entityId: string };
export type Field = { id: string; current: string | null };

const REPORT_REASONS = [
  "wrong_info",
  "misleading",
  "wrong_place",
  "closed",
  "fake_photo",
  "offensive",
  "other",
] as const;

const INPUT = "h-12 w-full rounded-input border border-border bg-background px-3.5 text-base";
const SEND =
  "h-14 w-full press rounded-button bg-primary text-[17px] font-semibold text-primary-foreground disabled:opacity-60";

/** Turns a failed Result into a sentence; sends signed-out visitors to log in and back. */
function useFailure() {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  return (error: { code: string; fields?: Record<string, string> | undefined }) => {
    if (error.code === "auth_required") {
      router.push(routes.login({ next: pathname }));
      return;
    }
    if (error.code === "validation" && Object.values(error.fields ?? {}).includes("profanity")) {
      toast.error(t("moderation.profanity"));
      return;
    }
    if (error.code === "conflict") {
      toast.error(t("moderation.alreadyReported"));
      return;
    }
    toast.error(t(`errors.${error.code}` as MessageKey));
  };
}

export function SuggestEditSheet({
  target,
  fields,
  onClose,
}: {
  target: Target;
  fields: Field[];
  onClose: () => void;
}) {
  const t = useT();
  const fail = useFailure();
  const [field, setField] = useState(fields[0]?.id ?? "other");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const current = fields.find((candidate) => candidate.id === field)?.current ?? null;

  function send() {
    startTransition(async () => {
      const result = await suggestEdit({
        ...target,
        field,
        proposedValue: value,
        note: note || null,
      });
      if (result.ok) {
        toast.success(t(result.data.applied ? "moderation.applied" : "moderation.sent"));
        onClose();
        return;
      }
      fail(result.error);
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetTitle className="text-heading">{t("moderation.suggest")}</SheetTitle>
        <SheetDescription>{t("moderation.fieldLabel")}</SheetDescription>
        <select
          aria-label={t("moderation.fieldLabel")}
          value={field}
          onChange={(event) => setField(event.target.value)}
          className={INPUT}
        >
          {[...fields.map((candidate) => candidate.id), "other"]
            .filter((id, index, all) => all.indexOf(id) === index)
            .map((id) => (
              <option key={id} value={id}>
                {t(`moderation.fields.${id}` as MessageKey)}
              </option>
            ))}
        </select>
        {current && (
          <p className="text-meta text-muted-foreground">
            {t("moderation.current", { value: current })}
          </p>
        )}
        <input
          aria-label={t("moderation.proposed")}
          placeholder={t("moderation.proposed")}
          maxLength={300}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={INPUT}
        />
        <input
          aria-label={t("moderation.note")}
          placeholder={t("moderation.note")}
          maxLength={300}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={INPUT}
        />
        <button
          type="button"
          disabled={pending || value.trim() === ""}
          onClick={send}
          className={SEND}
        >
          {t("moderation.send")}
        </button>
      </SheetContent>
    </Sheet>
  );
}

export function ReportSheet({ target, onClose }: { target: Target; onClose: () => void }) {
  const t = useT();
  const fail = useFailure();
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("wrong_info");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function send() {
    startTransition(async () => {
      const result = await reportContent({ ...target, reason, note: note || null });
      if (result.ok) {
        toast.success(t("moderation.reported"));
        onClose();
        return;
      }
      fail(result.error);
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetTitle className="text-heading">{t("moderation.report")}</SheetTitle>
        <SheetDescription>{t("moderation.reasonLabel")}</SheetDescription>
        <div className="flex flex-wrap gap-2">
          {REPORT_REASONS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={reason === id}
              onClick={() => setReason(id)}
              className={cn(
                "h-10 rounded-full px-3.5 text-sm",
                reason === id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card",
              )}
            >
              {t(`moderation.reasons.${id}`)}
            </button>
          ))}
        </div>
        <input
          aria-label={t("verify.note")}
          placeholder={t("verify.note")}
          maxLength={300}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className={INPUT}
        />
        <button type="button" disabled={pending} onClick={send} className={SEND}>
          {t("moderation.send")}
        </button>
      </SheetContent>
    </Sheet>
  );
}
