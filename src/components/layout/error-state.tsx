import { TriangleAlertIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ErrorStateProps = {
  /** What went wrong, plainly ("তথ্য আনা যায়নি।"). */
  title: ReactNode;
  /** How to fix it, if the user can. */
  description?: ReactNode;
  /** A retry button or a link elsewhere. */
  action?: ReactNode;
  className?: string;
};

/** A section or page that failed to load. Status uses icon + text, never color alone. */
export function ErrorState({ title, description, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-2 rounded-card-lg border border-border bg-card p-5 text-center",
        className,
      )}
    >
      <TriangleAlertIcon className="size-7 text-danger" aria-hidden />
      <p className="text-card-title">{title}</p>
      {description && <p className="text-meta text-muted-foreground">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
