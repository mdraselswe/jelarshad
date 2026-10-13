import { MedalIcon } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { getServices } from "@/infrastructure/container";
import { getT } from "@/i18n/server";

// One height for the signed-in card, the guest invitation and the skeleton.
const CARD =
  "relative z-10 mx-4 -mt-3 flex h-[88px] items-center gap-3.5 rounded-[26px] bg-card px-4 shadow-floating md:mx-7 lg:hidden";

export function DistrictStampCardSkeleton() {
  return (
    <Skeleton className="relative z-10 mx-4 -mt-3 h-[88px] rounded-[26px] md:mx-7 lg:hidden" />
  );
}

/** Phone only: has this visitor earned the district's stamp yet? Reads the session, so Suspense. */
export async function DistrictStampCard({
  districtId,
  nameBn,
  slug,
}: {
  districtId: number;
  nameBn: string;
  slug: string;
}) {
  const t = getT();
  const session = await getServices().auth.getSession();
  const stamped = session
    ? (await getServices().rewards.summary(session.user.id)).stamps.some(
        (stamp) => stamp.districtId === districtId,
      )
    : false;
  const body = (
    <>
      <span
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-[20px] bg-grad-reward text-on-reward"
      >
        <MedalIcon className="size-[30px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-card-title">
          {t("district.stampTitle", { district: nameBn })}
        </span>
        <span className="line-clamp-1 text-meta text-muted-foreground">
          {stamped ? t("district.stampDone") : t("district.stampTodo")}
        </span>
      </span>
    </>
  );
  return session ? (
    <Link href={routes.me()} className={`${CARD} press animate-rise`}>
      {body}
    </Link>
  ) : (
    <Link
      href={routes.login({ next: routes.district(slug) })}
      className={`${CARD} press animate-rise`}
    >
      {body}
    </Link>
  );
}
