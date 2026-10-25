"use client";

import { XIcon } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * A short list of names typed one at a time: Enter (or a comma) adds the typed name as a chip, the
 * chip's × takes it out. Used for the extra names a place can be searched by. Labels come from the
 * caller, so public and admin pages can each use their own messages.
 */
export function NameChipsInput({
  value,
  onChange,
  max,
  label,
  hint,
  placeholder,
  addLabel,
  removeLabel,
  inputClassName,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
  label: React.ReactNode;
  hint?: string;
  placeholder?: string;
  addLabel: string;
  removeLabel: (name: string) => string;
  inputClassName?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const full = value.length >= max;

  function add() {
    const name = draft.replace(/[,،]/g, " ").replace(/\s+/g, " ").trim();
    if (name === "" || full) return;
    if (!value.some((item) => item.toLowerCase() === name.toLowerCase())) {
      onChange([...value, name]);
    }
    setDraft("");
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-meta font-semibold">
        {label}
      </label>
      {value.length > 0 ? (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((name) => (
            <li
              key={name}
              className="flex h-9 items-center gap-1 rounded-full bg-primary-soft pr-1 pl-3.5 text-[14.5px] font-semibold text-primary-soft-fg"
            >
              {name}
              <button
                type="button"
                aria-label={removeLabel(name)}
                onClick={() => onChange(value.filter((item) => item !== name))}
                className="flex size-7 items-center justify-center rounded-full hover:bg-card/60"
              >
                <XIcon className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {full ? null : (
        <div className="flex gap-2">
          <input
            id={id}
            value={draft}
            maxLength={80}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                add();
              }
            }}
            className={cn(
              "h-12 min-w-0 flex-1 rounded-input border border-border bg-card px-3.5 text-base",
              inputClassName,
            )}
          />
          <button
            type="button"
            onClick={add}
            disabled={draft.trim() === ""}
            className="h-12 shrink-0 press rounded-full bg-primary-soft px-4 text-sm font-semibold text-primary-soft-fg disabled:opacity-50"
          >
            {addLabel}
          </button>
        </div>
      )}
      {hint ? <p className="mt-1.5 text-caption text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
