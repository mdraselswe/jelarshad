"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { toast } from "@/lib/toast";

import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/t";
import { cn } from "@/lib/cn";
import type { Reaction } from "@/core/domain";

import { AddPhotoButton } from "@/features/media/components/add-photo-button";
import { offerLeaderboard } from "@/features/game/offer-leaderboard";
import { showReward } from "@/features/reward/show-reward";

import { addExperience } from "../actions";
import { REACTION_HEADING_CLASS } from "./reaction-styles";

export type DishOption = { dishId: string; label: string };

// 😋 😐 👎 as in docs/design/C-Food: ink and fill follow the status tokens, never colour alone.
const REACTIONS: readonly { id: Reaction; label: MessageKey; tone: string }[] = [
  {
    id: "loved",
    label: "reaction.lovedShort",
    tone: "border-success bg-success-soft text-success-fg",
  },
  {
    id: "okay",
    label: "reaction.okayShort",
    tone: "border-warning bg-warning-soft text-warning-fg",
  },
  {
    id: "disliked",
    label: "reaction.dislikedShort",
    tone: "border-danger bg-danger-soft text-danger-fg",
  },
];

function Face({ reaction }: { reaction: Reaction }) {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="16" cy="16" r="13" />
      {reaction === "loved" && (
        <path d="M10 18c1.5 3 3.5 4.5 6 4.5s4.5-1.5 6-4.5z" fill="currentColor" />
      )}
      {reaction === "okay" && <path d="M11 20h10" />}
      {reaction === "disliked" && <path d="M11 22c1.4-2.2 3-3.2 5-3.2s3.6 1 5 3.2" />}
      <path d="M11 12.5v1M21 12.5v1" />
    </svg>
  );
}

/**
 * "আপনি খেয়েছেন? কেমন লাগল?": the reaction buttons. With one dish a tap saves straight away; with
 * several (a food page lists many places) the person picks where they ate, then confirms. Signed-out
 * visitors are sent to log in and brought back.
 */
export function ReactionPicker({ options }: { options: DishOption[] }) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<Reaction | null>(null);
  // Reactions saved in this visit show at once; the server catches up in the background.
  const [saved, setSaved] = useState<Record<string, Reaction>>({});
  const [editing, setEditing] = useState(false);
  // The visitor's earlier reactions, fetched once the page is up so the page itself stays static.
  const [mine, setMine] = useState<Record<string, Reaction>>({});
  const [experiences, setExperiences] = useState<Record<string, { id: string; photos: number }>>(
    {},
  );
  // Photos attached in this visit, per experience id.
  const [addedPhotos, setAddedPhotos] = useState<Record<string, number>>({});
  const dishKey = options.map((option) => option.dishId).join(",");
  useEffect(() => {
    if (dishKey === "") return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`/api/reactions?dishes=${encodeURIComponent(dishKey)}`);
        if (!response.ok) return;
        const body = (await response.json()) as {
          mine?: Record<string, Reaction>;
          experiences?: Record<string, { id: string; photos: number }>;
        };
        if (cancelled) return;
        if (body.mine) setMine(body.mine);
        if (body.experiences) setExperiences(body.experiences);
      } catch {
        // Offline or blocked: the plain picker still works.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dishKey]);
  const known: Record<string, Reaction> = { ...mine, ...saved };
  const firstOpen = options.find((option) => known[option.dishId] === undefined);
  const [dishId, setDishId] = useState((firstOpen ?? options[0])?.dishId ?? "");
  const single = options.length <= 1;
  const allAnswered = options.length > 0 && firstOpen === undefined;
  const headingId = useId();
  const selectId = useId();

  function save(reaction: Reaction, forDish: string) {
    setPicked(reaction);
    const before = saved[forDish];
    setSaved((current) => ({ ...current, [forDish]: reaction }));
    setEditing(false);
    startTransition(async () => {
      const result = await addExperience({ dishId: forDish, reaction });
      if (result.ok) {
        setPicked(null);
        setExperiences((current) => ({
          ...current,
          [forDish]: current[forDish] ?? { id: result.data.experienceId, photos: 0 },
        }));
        showReward(
          t,
          result.data.reward,
          t(result.data.isNew ? "experience.added" : "experience.updated"),
        );
        if (result.data.isNew) offerLeaderboard(t);
        return;
      }
      setPicked(null);
      setSaved((current) => {
        const next = { ...current };
        if (before === undefined) delete next[forDish];
        else next[forDish] = before;
        return next;
      });
      if (result.error.code === "auth_required") {
        router.push(routes.login({ next: pathname }));
        return;
      }
      toast.error(t(`errors.${result.error.code}`));
    });
  }

  if (options.length === 0) return null;

  if (allAnswered && !editing) {
    const tone = (id: Reaction) => REACTIONS.find((reaction) => reaction.id === id);
    return (
      <div>
        <p className={REACTION_HEADING_CLASS}>{t("experience.mine")}</p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {options.map((option) => {
            const current = known[option.dishId];
            const reaction = current ? tone(current) : undefined;
            if (!current || !reaction) return null;
            return (
              <li
                key={option.dishId}
                className={cn(
                  "flex min-h-12 items-center gap-2.5 rounded-[16px] border-2 px-3 text-[15px] font-semibold",
                  reaction.tone,
                )}
              >
                <Face reaction={current} />
                <span className="min-w-0 flex-1 truncate">
                  {single ? t(reaction.label) : `${option.label}: ${t(reaction.label)}`}
                </span>
              </li>
            );
          })}
        </ul>
        {single && options[0] && experiences[options[0].dishId] ? (
          <div className="mt-3 flex items-center gap-2 text-meta text-muted-foreground">
            <AddPhotoButton
              experienceId={experiences[options[0].dishId]?.id ?? ""}
              photoCount={
                (experiences[options[0].dishId]?.photos ?? 0) +
                (addedPhotos[experiences[options[0].dishId]?.id ?? ""] ?? 0)
              }
              onAdded={(count) =>
                setAddedPhotos((current) => {
                  const id = experiences[options[0]?.dishId ?? ""]?.id ?? "";
                  return { ...current, [id]: (current[id] ?? 0) + count };
                })
              }
              className="border border-border"
            />
            <span>{t("photos.addHint")}</span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setPicked(null);
          }}
          className="mt-3 flex h-11 w-full press items-center justify-center rounded-button bg-primary-soft text-[15px] font-semibold text-primary-soft-fg"
        >
          {t("experience.change")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className={REACTION_HEADING_CLASS} id={headingId}>
        {t("experience.question")}
      </p>
      <div role="group" aria-labelledby={headingId} className="mt-2.5 grid grid-cols-3 gap-2">
        {REACTIONS.map(({ id, label, tone }) => {
          const on = picked === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              disabled={pending}
              onClick={() => (single ? save(id, dishId) : setPicked(id))}
              className={cn(
                "flex h-21 press flex-col items-center justify-center gap-1 rounded-[18px] border-2 text-[15px] font-semibold transition-colors",
                on ? tone : "border-transparent bg-background text-foreground",
              )}
            >
              <Face reaction={id} />
              {t(label)}
            </button>
          );
        })}
      </div>

      {!single && picked !== null && (
        <div className="mt-3.5">
          <label htmlFor={selectId} className="text-meta font-semibold">
            {t("experience.where")}
          </label>
          <select
            id={selectId}
            value={dishId}
            onChange={(event) => setDishId(event.target.value)}
            className="mt-1.5 h-12 w-full rounded-input border border-border bg-card px-3 text-base"
          >
            {options.map((option) => (
              <option key={option.dishId} value={option.dishId}>
                {known[option.dishId] !== undefined ? `✓ ${option.label}` : option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={pending}
            onClick={() => save(picked, dishId)}
            className="mt-3 flex h-12 w-full press items-center justify-center rounded-button bg-primary text-base font-semibold text-primary-foreground disabled:opacity-60"
          >
            {t("experience.submit")}
          </button>
        </div>
      )}
    </div>
  );
}
