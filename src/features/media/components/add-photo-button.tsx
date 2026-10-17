"use client";

import { CameraIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { appConfig } from "@/config/app.config";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

import { attachPhotos } from "../actions";
import { uploadPhotos } from "../upload";

/**
 * "ছবি যোগ করুন" for an experience the person already shared: pick photos, upload, attach. It only
 * offers as many photos as there is room for, and hides when the experience is full.
 */
export function AddPhotoButton({
  experienceId,
  photoCount,
  onAdded,
  className,
}: {
  experienceId: string;
  /** Photos already attached. */
  photoCount: number;
  /** Called with how many photos were just attached. */
  onAdded?: (count: number) => void;
  className?: string;
}) {
  const t = useT();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const room = appConfig.media.maxPhotosPerExperience - photoCount;
  if (room <= 0) return null;

  async function onPick(files: FileList | null) {
    const picked = Array.from(files ?? []).slice(0, room);
    if (input.current) input.current.value = "";
    if (picked.length === 0) return;
    setBusy(true);
    try {
      const uploaded = await uploadPhotos(picked);
      const attached =
        uploaded.keys.length > 0 ? await attachPhotos({ experienceId, keys: uploaded.keys }) : null;
      if (uploaded.failed > 0 || (attached && !attached.ok)) toast.error(t("photos.failed"));
      if (attached?.ok) {
        toast.success(t("photos.added"));
        onAdded?.(uploaded.keys.length);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={room > 1}
        hidden
        onChange={(event) => void onPick(event.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        aria-label={t("photos.add")}
        className={cn(
          "flex size-11 shrink-0 press items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-60",
          className,
        )}
      >
        <CameraIcon className="size-[18px]" aria-hidden />
      </button>
    </>
  );
}
