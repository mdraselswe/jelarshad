import type { ReactNode } from "react";

import type { IconChipTone } from "@/components/ui/icon-chip";

import { Panel } from "./panel";

type SectionProps = {
  title: ReactNode;
  /** Right of the title, e.g. a "সব দেখুন" link. */
  action?: ReactNode;
  /** Icon in the colored chip before the title (docs/06-design-system.md §2d). */
  icon?: ReactNode;
  tone?: IconChipTone;
  children: ReactNode;
  className?: string;
};

// A grouped list or chip row directly inside a section is flattened: the panel is its card, so the
// list does not draw a second border and background inside it.
const FLAT_LISTS =
  "[&>ul]:rounded-none [&>ul]:border-0 [&>ul]:bg-transparent [&>ul]:shadow-none lg:[&>ul]:overflow-visible";

/**
 * A titled page section: a white panel on the dotted ground, headed by an optional icon chip
 * (docs/06-design-system.md §2d). The heading names the region, so screen-reader users can jump
 * between sections. For tinted full-width sections use `Band`.
 */
export function Section({ title, action, icon, tone, children, className }: SectionProps) {
  return (
    <Panel
      title={title}
      action={action}
      icon={icon}
      tone={tone}
      className={className}
      cardClassName={FLAT_LISTS}
    >
      {children}
    </Panel>
  );
}
