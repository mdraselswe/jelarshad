"use client";

import { LocateFixedIcon, MapPinIcon, StoreIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Section } from "@/components/layout/section";
import { GroupedList, ListRow, ListTile } from "@/components/ui/grouped-list";
import { routes } from "@/config/routes";
import { useT } from "@/i18n/client";
import { formatNumber } from "@/lib/format/number";
import type { NearbyResult } from "@/services/catalog-service";

type State =
  | { step: "idle" }
  | { step: "asking" }
  | { step: "loaded"; result: NearbyResult }
  | { step: "denied" }
  | { step: "failed" };

/**
 * "আমার কাছে": asks the browser for the person's position only when they tap, sends it once to
 * /api/near and shows neighbourhoods and places around it, nearest first. The position is not
 * stored anywhere. Distances are to the neighbourhood centre, and the page says so.
 */
export function NearMe() {
  const t = useT();
  const [state, setState] = useState<State>({ step: "idle" });

  function locate() {
    if (!("geolocation" in navigator)) {
      setState({ step: "failed" });
      return;
    }
    setState({ step: "asking" });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`/api/near?lat=${latitude}&lng=${longitude}`);
          if (!response.ok) throw new Error(String(response.status));
          setState({ step: "loaded", result: (await response.json()) as NearbyResult });
        } catch {
          setState({ step: "failed" });
        }
      },
      (error) => setState({ step: error.code === error.PERMISSION_DENIED ? "denied" : "failed" }),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60_000 },
    );
  }

  const button = (
    <button
      type="button"
      onClick={locate}
      disabled={state.step === "asking"}
      className="mx-auto flex h-12 press items-center gap-2 rounded-full bg-primary px-6 text-[16px] font-semibold text-primary-foreground disabled:opacity-60"
    >
      <LocateFixedIcon className="size-5" aria-hidden />
      {state.step === "asking" ? t("near.asking") : t("near.useLocation")}
    </button>
  );

  if (state.step === "loaded") {
    const { areas, nearestKm } = state.result;
    return (
      <div>
        {areas.length === 0 ? (
          <div className="page-x pt-6 text-center">
            <p className="text-card-title">{t("near.none")}</p>
            <p className="mt-1 text-meta text-muted-foreground">
              {nearestKm !== null
                ? t("near.noneHintFar", { km: formatNumber(nearestKm) })
                : t("near.noneHint")}
            </p>
            <div className="mt-4">
              <Link
                href={routes.districts()}
                className="inline-flex h-11 press items-center rounded-full bg-primary-soft px-5 text-[15px] font-semibold text-primary-soft-fg"
              >
                {t("near.browseDistricts")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {areas.map((area) => (
              <Section
                key={`${area.districtSlug}/${area.slug}`}
                title={`${area.nameBn}, ${area.districtNameBn}`}
                icon={<MapPinIcon />}
                tone="teal"
                action={
                  <span className="text-[13px] font-semibold text-muted-foreground">
                    {t("near.about", { km: formatNumber(area.distanceKm) })}
                  </span>
                }
              >
                <GroupedList split>
                  {area.places.map((place) => (
                    <ListRow
                      key={place.slug}
                      href={routes.place(place.slug)}
                      leading={
                        <ListTile tone="place">
                          <StoreIcon />
                        </ListTile>
                      }
                      title={place.nameBn}
                      meta={t(`placeType.${place.type}`)}
                    />
                  ))}
                </GroupedList>
                <Link
                  href={routes.area(area.districtSlug, area.slug)}
                  className="mt-3 flex h-10 press items-center justify-center rounded-full bg-primary-soft text-[14px] font-semibold text-primary-soft-fg"
                >
                  {t("near.seeArea", { area: area.nameBn })}
                </Link>
              </Section>
            ))}
            <p className="page-x pt-4 text-center text-meta text-muted-foreground">
              {t("near.approximate")}
            </p>
          </>
        )}
        <div className="page-x pt-5">{button}</div>
      </div>
    );
  }

  return (
    <div className="page-x pt-6 text-center">
      <p className="text-card-title">{t("near.prompt")}</p>
      <p className="mx-auto mt-1 max-w-sm text-meta text-muted-foreground">{t("near.privacy")}</p>
      <div className="mt-5">{button}</div>
      {state.step === "denied" ? (
        <p role="alert" className="mt-4 text-meta text-danger-fg">
          {t("near.denied")}
        </p>
      ) : null}
      {state.step === "failed" ? (
        <p role="alert" className="mt-4 text-meta text-danger-fg">
          {t("near.failed")}
        </p>
      ) : null}
    </div>
  );
}
