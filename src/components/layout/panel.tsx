import { useId, type ReactNode } from "react";

import { IconChip, type IconChipTone } from "@/components/ui/icon-chip";
import { cn } from "@/lib/cn";

type PanelProps = {
  title: ReactNode;
  icon?: ReactNode;
  tone?: IconChipTone | undefined;
  /** Right of the title, e.g. a "সব দেখুন" link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string | undefined;
  /** The container already has the page gutter and spacing: no padding of its own. */
  bare?: boolean;
  /** Classes for the white card itself. */
  cardClassName?: string | undefined;
};

/**
 * A white rounded panel on the dotted page ground, headed by an icon chip and a title
 * (docs/06-design-system.md §2d). The panel is the default container for lists and groups.
 */
export function Panel({
  title,
  icon,
  tone = "violet",
  action,
  children,
  className,
  bare = false,
  cardClassName,
}: PanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("animate-rise", !bare && "page-x pt-5 lg:pt-8", className)}
    >
      <div
        className={cn(
          "rounded-[28px] border border-border bg-card p-4 shadow-card lg:rounded-[32px] lg:p-6",
          cardClassName,
        )}
      >
        <div className="mb-3 flex items-center gap-2.5">
          {icon ? <IconChip tone={tone}>{icon}</IconChip> : null}
          <h2 id={headingId} className="min-w-0 flex-1 text-heading">
            {title}
          </h2>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}
