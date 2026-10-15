"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { MediaRef } from "@/core/domain";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format/number";

import { AppImage } from "./app-image";

const PhotoViewer = dynamic(() => import("./photo-viewer").then((mod) => mod.PhotoViewer), {
  ssr: false,
});

const SHOWN_ON_DESKTOP = 5;

/**
 * The photos people shared, right under the hero. A phone gets a swipeable strip whose next photo
 * peeks in from the edge; a desktop gets a mosaic (one large photo and up to four small ones, the
 * last one carrying "+N" when there are more). Heights are fixed, so nothing moves while images
 * load. A tap or click opens the viewer on that photo.
 */
export function PhotoShowcase({ photos, label }: { photos: MediaRef[]; label: string }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;
  const mosaic = photos.slice(0, SHOWN_ON_DESKTOP);
  const more = photos.length - SHOWN_ON_DESKTOP;
  const open_ = (index: number) => (
    <button
      type="button"
      onClick={() => setOpen(index)}
      aria-label={t("photos.open", { n: formatNumber(index + 1) })}
      className="absolute inset-0 press"
    />
  );

  return (
    <section aria-label={label} className="page-x pt-5 lg:pt-6">
      {/* Phone: a snap strip, each photo about three quarters of the width so the next one peeks in. */}
      <ul className="-mx-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-5 lg:hidden">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className={cn(
              "relative aspect-[16/10] shrink-0 snap-start overflow-hidden rounded-[22px] bg-muted shadow-card",
              photos.length === 1 ? "w-full" : "w-[74%] max-w-[320px]",
            )}
          >
            <AppImage
              media={photo}
              alt=""
              sizes="(max-width: 1023px) 320px, 0px"
              className="size-full"
              priority={index === 0}
            />
            {open_(index)}
          </li>
        ))}
      </ul>

      {/* Desktop: a mosaic, large photo first. */}
      <ul
        className={cn(
          "hidden h-[340px] gap-3 lg:grid",
          mosaic.length === 1 && "grid-cols-1 lg:max-w-3xl",
          mosaic.length === 2 && "grid-cols-3 [&>li:first-child]:col-span-2",
          mosaic.length >= 3 &&
            "grid-cols-4 grid-rows-2 [&>li:first-child]:col-span-2 [&>li:first-child]:row-span-2",
        )}
      >
        {mosaic.map((photo, index) => (
          <li
            key={photo.id}
            className="relative overflow-hidden rounded-[22px] bg-muted shadow-card"
          >
            <AppImage
              media={photo}
              alt=""
              sizes={index === 0 ? "560px" : "280px"}
              className="size-full"
            />
            {open_(index)}
            {index === SHOWN_ON_DESKTOP - 1 && more > 0 ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 font-display text-[26px] font-bold text-white">
                +{formatNumber(more)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {open !== null && <PhotoViewer photos={photos} start={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
