import { ChevronRightIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { KIND_TONE_CLASS, toneClass, type Tone } from "@/lib/tone";

// Grouped list card (docs/06-design-system.md §6): one white card, rows separated by --divider,
// instead of many separate cards.

// `split`: one card on phones and tablets, a two-column grid of separate cards on desktop.
const SPLIT_CLASS =
  "lg:grid lg:grid-cols-2 lg:gap-4 lg:divide-y-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:[&>li]:overflow-hidden lg:[&>li]:rounded-card-lg lg:[&>li]:border lg:[&>li]:border-border lg:[&>li]:bg-card";

export function GroupedList({
  children,
  className,
  split,
}: {
  children: ReactNode;
  className?: string;
  split?: boolean;
}) {
  return (
    <ul
      className={cn(
        "divide-y divide-divider overflow-hidden rounded-card-lg border border-border bg-card",
        split && SPLIT_CLASS,
        className,
      )}
    >
      {children}
    </ul>
  );
}

const ROW_CLASS = "flex min-h-17 items-center gap-3 p-3";

function ListRowBody({
  leading,
  title,
  meta,
  trailing,
}: {
  leading: ReactNode;
  title: ReactNode;
  meta: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-card-title">{title}</div>
        <div className="line-clamp-1 text-meta text-muted-foreground">{meta}</div>
      </div>
      {trailing}
    </>
  );
}

/**
 * 44px rounded tile that holds an icon or a letter. `tone` colors it by kind (food, place, district),
 * `seed` colors a letter tile from the item's name; without either it is neutral.
 */
export function ListTile({
  children,
  tone,
  seed,
}: {
  children: ReactNode;
  tone?: Tone;
  seed?: string;
}) {
  const color = tone
    ? KIND_TONE_CLASS[tone]
    : seed
      ? toneClass(seed)
      : "bg-muted text-muted-foreground";
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-thumb font-display font-bold [&_svg]:size-5",
        color,
      )}
    >
      {children}
    </span>
  );
}

type ListRowProps = {
  href: string;
  leading: ReactNode;
  title: ReactNode;
  meta: ReactNode;
  /** Right side; defaults to a chevron (an external-link icon when `external`). */
  trailing?: ReactNode;
  /** Opens another site in a new tab. */
  external?: boolean;
};

export function ListRow({ href, leading, title, meta, trailing, external }: ListRowProps) {
  const Icon = external ? ExternalLinkIcon : ChevronRightIcon;
  const className = cn(ROW_CLASS, "press hover:bg-muted/50");
  const body = (
    <ListRowBody
      leading={leading}
      title={title}
      meta={meta}
      trailing={trailing ?? <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />}
    />
  );
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {body}
        </a>
      ) : (
        <Link href={href} className={className}>
          {body}
        </Link>
      )}
    </li>
  );
}

export function ListRowSkeleton({
  hasTrailing = true,
  trailing,
}: {
  hasTrailing?: boolean;
  /** Custom right-hand placeholder (e.g. a pill); replaces the default chevron-sized dot. */
  trailing?: ReactNode;
}) {
  return (
    <li className={ROW_CLASS}>
      <ListRowBody
        leading={<Skeleton className="size-11 shrink-0 rounded-thumb" />}
        title={<SkeletonText className="w-2/3" />}
        meta={<SkeletonText className="w-1/2" />}
        trailing={
          trailing ??
          (hasTrailing ? <Skeleton className="size-5 shrink-0 rounded-full" /> : undefined)
        }
      />
    </li>
  );
}
