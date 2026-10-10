import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionProps = {
  title: ReactNode;
  /** Right of the title, e.g. a "সব দেখুন" link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * A titled page section (docs/design: 24px top spacing, 20px page gutter, 21px heading). The heading
 * names the region, so screen-reader users can jump between sections.
 */
export function Section({ title, action, children, className }: SectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("animate-rise page-x pt-6 lg:pt-10", className)}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h2 id={headingId} className="text-heading">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
