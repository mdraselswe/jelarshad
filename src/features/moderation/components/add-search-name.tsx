"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useT } from "@/i18n/client";

// Loads on the first tap, like the other edit sheets, so the place page does not pay for it.
const SuggestEditSheet = dynamic(
  () => import("./content-sheets").then((mod) => mod.SuggestEditSheet),
  { ssr: false },
);

/**
 * "নাম যোগ করুন" on the place page: another name people search the place by. The person who added
 * the place sees it at once; anyone else's goes to an admin first.
 */
export function AddSearchName({ placeId }: { placeId: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 shrink-0 press rounded-full bg-primary-soft px-3.5 text-sm font-semibold text-primary-soft-fg"
      >
        {t("place.addSearchName")}
      </button>
      {open && (
        <SuggestEditSheet
          target={{ entity: "place", entityId: placeId }}
          fields={[{ id: "alias", current: null }]}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
