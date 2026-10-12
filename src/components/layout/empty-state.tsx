import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/format/number";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  /** What is missing, said as an invitation ("কোথায় ভালো পাওয়া যায়, এখনও কেউ জানায়নি।"). */
  message: ReactNode;
  /** The one action that fills the gap. */
  action?: { label: string; href: string };
  /** Points earned for that action, shown as a gold pill ("+২০"). */
  rewardPoints?: number;
  /** A small live illustration above the message. */
  art?: ReactNode;
  className?: string;
};

/** Empty state = invitation (docs/06-design-system.md §6): dashed box, one primary button, reward hint. */
export function EmptyState({ message, action, rewardPoints, art, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-card-lg border-[1.5px] border-dashed border-primary/30 bg-primary-soft p-4 text-center",
        className,
      )}
    >
      {art ? (
        <div aria-hidden className="mx-auto mb-2 w-36">
          {art}
        </div>
      ) : null}
      <p className="text-[15px] leading-relaxed">{message}</p>
      {action && (
        <Button asChild className="mt-2.5">
          <Link href={action.href}>
            {action.label}
            {rewardPoints !== undefined && (
              <span className="rounded-[10px] bg-reward px-1.5 text-caption font-display font-bold text-reward-foreground">
                +{formatNumber(rewardPoints)}
              </span>
            )}
          </Link>
        </Button>
      )}
    </div>
  );
}
