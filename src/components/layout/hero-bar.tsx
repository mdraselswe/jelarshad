import type { ReactNode } from "react";

import { BackButton } from "./back-button";

/**
 * The phone-only top row of a hero band: back to the fixed parent on the left, round actions (save,
 * share) on the right. The band's `on-hero-actions` styling makes the buttons translucent.
 */
export function HeroBar({ backHref, actions }: { backHref: string; actions?: ReactNode }) {
  return (
    <>
      <BackButton href={backHref} />
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </>
  );
}
