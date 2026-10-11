import { ClaimStatusBadge } from "@/features/claim/components/claim-status-badge";
import { StillCorrectButton, VerifyPrompt } from "@/features/claim/components/verify-prompt";
import { Skeleton } from "@/components/ui/skeleton";
import { getT } from "@/i18n/server";
import { claimBadge } from "@/lib/claims/badge";

import { getPlaceClaims } from "../queries";

const SKELETON_ROWS = 2;
const ROW_CLASS = "flex min-h-9 flex-wrap items-center gap-2";

/** The white card that floats over the bottom of the hero (docs/design: M-Place). */
function CardShell({
  title,
  children,
  ariaHidden,
}: {
  title: string;
  children: React.ReactNode;
  ariaHidden?: boolean;
}) {
  return (
    <div className="relative z-10 -mt-5 page-x" aria-hidden={ariaHidden}>
      <div className="rounded-card-lg bg-card p-4 shadow-floating lg:max-w-3xl lg:p-5">
        <p className="mb-3 text-card-title">{title}</p>
        <ul className="flex flex-col gap-2">{children}</ul>
      </div>
    </div>
  );
}

/**
 * What the community knows about this place and its dishes, one badge per fact, each with a way to
 * confirm it: a one-tap "এখনও ঠিক আছে?" when it is stale, and the full verify sheet.
 */
export async function PlaceClaimsSection({ placeId }: { placeId: string }) {
  const t = getT();
  const { items: claims, asOf } = await getPlaceClaims(placeId);
  if (claims.length === 0) return null;
  return (
    <CardShell title={t("place.verifyTitle")}>
      {claims.map((claim) => {
        const stale = claimBadge(claim, asOf).kind === "stale";
        const summary = [claim.subject, t(`claim.types.${claim.type}`), claim.valueText]
          .filter(Boolean)
          .join(" · ");
        return (
          <li key={claim.id} className={ROW_CLASS}>
            <ClaimStatusBadge claim={claim} now={asOf} />
            {stale && <StillCorrectButton claimId={claim.id} />}
            <VerifyPrompt claimId={claim.id} summary={summary} />
          </li>
        );
      })}
    </CardShell>
  );
}

export function PlaceClaimsSectionSkeleton() {
  return (
    <CardShell title={getT()("place.verifyTitle")} ariaHidden>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <li key={index} className={ROW_CLASS}>
          <Skeleton className="h-7 w-44 rounded-[10px]" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </li>
      ))}
    </CardShell>
  );
}
