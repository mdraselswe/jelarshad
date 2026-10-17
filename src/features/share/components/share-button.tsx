"use client";

import { CopyIcon, ShareIcon } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShare } from "@/hooks/use-share";
import { useT } from "@/i18n/client";
import { track } from "@/lib/analytics/client";
import { toast } from "@/lib/toast";

/** True on a phone or tablet: a touch screen, where the system share sheet is the right tool. */
const prefersSystemSheet = () =>
  typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;

/**
 * 44px round share button (docs/design/C-Food). `path` is the page being shared. Phones open the
 * system share sheet (Messenger, WhatsApp...). A desktop browser has no useful sheet, so it opens a
 * small menu: copy the link, or send it on WhatsApp, Facebook or Telegram.
 */
export function ShareButton({ title, path }: { title: string; path: string }) {
  const t = useT();
  const share = useShare();
  const [open, setOpen] = useState(false);

  async function systemShare() {
    track("share", { path });
    const result = await share({ title, path });
    if (result === "copied") toast.success(t("share.copied"));
    if (result === "failed") toast.error(t("errors.unknown"));
  }

  async function copy() {
    track("share", { path, via: "copy" });
    try {
      await navigator.clipboard.writeText(new URL(path, window.location.origin).toString());
      toast.success(t("share.copied"));
    } catch {
      toast.error(t("errors.unknown"));
    }
  }

  const url = () => encodeURIComponent(new URL(path, window.location.origin).toString());
  const text = encodeURIComponent(title);
  const channels = [
    { id: "whatsapp", href: () => `https://wa.me/?text=${text}%20${url()}` },
    { id: "facebook", href: () => `https://www.facebook.com/sharer/sharer.php?u=${url()}` },
    { id: "telegram", href: () => `https://t.me/share/url?url=${url()}&text=${text}` },
  ] as const;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        if (next && prefersSystemSheet()) {
          void systemShare();
          return;
        }
        setOpen(next);
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("share.label")}
          className="flex size-11 press items-center justify-center rounded-full border border-border bg-card"
        >
          <ShareIcon className="size-[19px]" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem onSelect={() => void copy()}>
          <CopyIcon aria-hidden />
          {t("share.copy")}
        </DropdownMenuItem>
        {channels.map((channel) => (
          <DropdownMenuItem
            key={channel.id}
            onSelect={() => {
              track("share", { path, via: channel.id });
              window.open(channel.href(), "_blank", "noopener,noreferrer");
            }}
          >
            {t(`share.${channel.id}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
