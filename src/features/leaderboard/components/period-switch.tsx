"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type Period = "week" | "month" | "all";

/**
 * Switches between the three boards. All three arrive rendered from the server, so a switch is
 * instant; the active board is keyed so its podium and bars play their entrance again.
 */
export function PeriodSwitch({
  label,
  periods,
  panels,
}: {
  label: string;
  periods: { id: Period; label: string }[];
  panels: Record<Period, ReactNode>;
}) {
  const [active, setActive] = useState<Period>("week");
  return (
    <>
      <div
        role="tablist"
        aria-label={label}
        className="mx-auto flex w-full max-w-md gap-1.5 rounded-full bg-muted p-1.5"
      >
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            role="tab"
            id={`board-tab-${period.id}`}
            aria-selected={active === period.id}
            aria-controls={`board-${period.id}`}
            onClick={() => setActive(period.id)}
            className={cn(
              "h-10 min-w-0 flex-1 rounded-full px-3 text-[14px] font-semibold transition-colors lg:h-11 lg:text-[15px]",
              active === period.id
                ? "bg-card text-foreground shadow-segment"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="block truncate">{period.label}</span>
          </button>
        ))}
      </div>
      <div
        key={active}
        role="tabpanel"
        id={`board-${active}`}
        aria-labelledby={`board-tab-${active}`}
        className="mt-5"
      >
        {panels[active]}
      </div>
    </>
  );
}
