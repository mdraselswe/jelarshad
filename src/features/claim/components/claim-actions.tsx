"use client";

import type { ReactNode } from "react";

import { useViewerId } from "@/hooks/use-viewer-id";
import { useT } from "@/i18n/client";

/**
 * The verify buttons of one fact. Whoever added the fact sees a note instead (they cannot confirm
 * their own fact; other people verify it), everyone else sees the buttons.
 */
export function ClaimActions({
  createdBy,
  children,
}: {
  createdBy: string | null;
  children: ReactNode;
}) {
  const t = useT();
  const viewerId = useViewerId();
  if (createdBy !== null && viewerId === createdBy) {
    return <span className="text-meta text-muted-foreground">{t("verify.ownClaim")}</span>;
  }
  return <>{children}</>;
}
