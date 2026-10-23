import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  ClockIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getT } from "@/i18n/server";
import { claimBadge } from "@/lib/claims/badge";
import type { ClaimType } from "@/lib/claims/status";
import { formatNumber } from "@/lib/format/number";
import type { PlaceClaimRow } from "@/services/catalog-service";

/**
 * What the community knows about one fact ("দাম · কমিউনিটি নিশ্চিত"). Always icon + text, and wording
 * follows decision P9: "কমিউনিটি নিশ্চিত", never "Verified".
 */
// A fact's line can be long ("দই · দাম · ৳১২০–৳১৮০ · শেষ নিশ্চিত ৩৪ দিন আগে"): it wraps instead of
// pushing the page sideways on a narrow phone.
const WRAP = "h-auto min-h-7 max-w-full py-1 text-left whitespace-normal";

export function ClaimStatusBadge({ claim, now }: { claim: PlaceClaimRow; now?: Date }) {
  const t = getT();
  const badge = claimBadge(claim, now);
  const typeLabel = t(`claim.types.${claim.type satisfies ClaimType}`);
  const type = [claim.subject, typeLabel, claim.valueText].filter(Boolean).join(" · ");

  switch (badge.kind) {
    case "confirmed":
      return (
        <Badge variant="success" className={WRAP}>
          <CircleCheckIcon aria-hidden />
          {type} · {t("claim.confirmed")}
        </Badge>
      );
    case "stale":
      return (
        <Badge variant="stale" className={WRAP}>
          <ClockIcon aria-hidden />
          {type} · {t("claim.stale", { days: formatNumber(badge.days ?? 0) })}
        </Badge>
      );
    case "mixed":
      return (
        <Badge variant="warning" className={WRAP}>
          <TriangleAlertIcon aria-hidden />
          {type} · {t("claim.mixed")}
        </Badge>
      );
    case "disputed":
      return (
        <Badge variant="danger" className={WRAP}>
          <CircleXIcon aria-hidden />
          {type} · {t("claim.disputed")}
        </Badge>
      );
    case "unverified":
      return (
        <Badge variant="muted" className={WRAP}>
          <CircleHelpIcon aria-hidden />
          {type} · {t("claim.unverified")}
        </Badge>
      );
  }
}
