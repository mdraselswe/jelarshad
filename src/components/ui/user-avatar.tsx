"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";

const initial = (name: string) => Array.from(name.trim())[0] ?? "?";

/**
 * A person's photo (the Google picture saved at sign-in) with their initial on a colour as the
 * fallback, so a missing or blocked photo never leaves a hole. `className` sets the size and shape.
 */
export function UserAvatar({
  name,
  src,
  seed,
  className,
}: {
  name: string;
  src: string | null | undefined;
  /** Picks the fallback colour; the person's id keeps it the same everywhere. */
  seed: string;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-11 after:hidden", className)}>
      {src ? <AvatarImage src={src} alt="" referrerPolicy="no-referrer" /> : null}
      <AvatarFallback
        className={cn("font-display font-bold text-inherit", toneClass(seed))}
        aria-hidden
      >
        {initial(name)}
      </AvatarFallback>
    </Avatar>
  );
}
