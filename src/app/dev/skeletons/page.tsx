import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GroupedList, ListRowSkeleton } from "@/components/ui/grouped-list";
import { Skeleton, SkeletonAvatar, SkeletonImage, SkeletonText } from "@/components/ui/skeleton";
import { FoodHitRow } from "@/features/search/components/search-hit-rows";
import { serverEnv } from "@/config/env";
import { DishRow, DishRowSkeleton } from "@/features/dish/components/dish-row";
import { FoodHero, FoodHeroSkeleton } from "@/features/food/components/food-hero";
import { PlaceHero, PlaceHeroSkeleton } from "@/features/place/components/place-hero";
import { DistrictChip, DistrictChipSkeleton } from "@/features/home/components/district-chip";
import {
  FamousFoodCard,
  FamousFoodCardSkeleton,
} from "@/features/home/components/famous-food-card";

import { SkeletonBoard, type SkeletonPair } from "./skeleton-board";

// Dev-only skeleton parity page (docs/05-loading-skeletons.md §9). Each feature component adds
// its { real, skeleton } pair here with fixture data as it is built (Phase 2+). Copy is fixture text.
export const metadata: Metadata = { title: "Skeletons", robots: { index: false } };

function RowShell({ media, children }: { media: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-card p-3">
      {media}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const PAIRS: readonly SkeletonPair[] = [
  {
    name: "Grouped list row (search hit)",
    real: (
      <GroupedList>
        <FoodHitRow
          hit={{ slug: "doi", nameBn: "দই", aboutBn: "মাটির হাঁড়িতে জমানো মিষ্টি দই।" }}
        />
      </GroupedList>
    ),
    skeleton: (
      <GroupedList>
        <ListRowSkeleton />
      </GroupedList>
    ),
  },
  {
    name: "Home: famous food card",
    real: (
      <FamousFoodCard
        item={{
          district: { slug: "bogura", nameBn: "বগুড়া" },
          food: { slug: "doi", nameBn: "দই" },
          noteBn: null,
        }}
      />
    ),
    skeleton: <FamousFoodCardSkeleton />,
  },
  {
    name: "Home: district chip",
    real: (
      <DistrictChip
        district={{ slug: "bogura", nameBn: "বগুড়া", famous: { slug: "doi", nameBn: "দই" } }}
      />
    ),
    skeleton: <DistrictChipSkeleton />,
  },
  {
    name: "Dish row (ranked)",
    real: (
      <GroupedList>
        <DishRow
          href="/place/sample-place"
          title="নমুনা দই ঘর"
          context="সাতমাথা, বগুড়া"
          price={{ min: 120, max: 180 }}
          experienceCount={26}
          display={{ percent: 92, rankable: true, favorite: true }}
          rank={1}
        />
      </GroupedList>
    ),
    skeleton: (
      <GroupedList>
        <DishRowSkeleton />
      </GroupedList>
    ),
  },
  {
    name: "Food hero",
    real: (
      <FoodHero
        food={{
          id: "f",
          slug: "doi",
          nameBn: "দই",
          nameEn: null,
          aboutBn: null,
          experienceCount: 26,
          percent: 92,
          famousIn: [],
        }}
      />
    ),
    skeleton: <FoodHeroSkeleton />,
  },
  {
    name: "Place hero",
    real: (
      <PlaceHero
        place={{
          id: "p",
          slug: "sample-place",
          nameBn: "নমুনা দই ঘর",
          nameEn: null,
          type: "shop",
          district: { slug: "bogura", nameBn: "বগুড়া" },
          areaNameBn: "সাতমাথা",
          address: null,
          phone: null,
          website: null,
          hoursText: null,
          mapQuery: "",
        }}
      />
    ),
    skeleton: <PlaceHeroSkeleton />,
  },
  {
    name: "Section + paragraph",
    real: (
      <Section title="কমিউনিটির প্রিয়" className="px-0 pt-0">
        <p className="line-clamp-2 text-body">
          বগুড়ার দই খেতে সবচেয়ে বেশি মানুষ যায় এই দোকানগুলোতে। দাম আর স্বাদ দুটোই মনে রাখার মতো।
        </p>
      </Section>
    ),
    skeleton: (
      <Section title="কমিউনিটির প্রিয়" className="px-0 pt-0">
        <SkeletonText className="text-body" lines={2} lastWidth="70%" />
      </Section>
    ),
  },
  {
    name: "Row: avatar + title + meta",
    real: (
      <RowShell
        media={
          <Avatar className="size-11">
            <AvatarFallback>আ</AvatarFallback>
          </Avatar>
        }
      >
        <p className="line-clamp-1 text-card-title">আকবরিয়া হোটেল</p>
        <p className="line-clamp-1 text-meta text-muted-foreground">সাতমাথা · ৳১২০–৳১৮০</p>
      </RowShell>
    ),
    skeleton: (
      <RowShell media={<SkeletonAvatar size={44} />}>
        <SkeletonText className="w-1/2 text-card-title" />
        <SkeletonText className="w-2/3 text-meta" />
      </RowShell>
    ),
  },
  {
    name: "Image 4:3 + caption",
    real: (
      <figure className="flex flex-col gap-2">
        <div className="aspect-[4/3] w-full rounded-card bg-muted" />
        <figcaption className="text-meta text-muted-foreground">দইয়ের হাঁড়ি</figcaption>
      </figure>
    ),
    skeleton: (
      <div className="flex flex-col gap-2">
        <SkeletonImage ratio="4/3" className="rounded-card" />
        <SkeletonText className="w-1/3 text-meta" />
      </div>
    ),
  },
  {
    name: "Pill",
    real: (
      <span className="inline-flex h-7 items-center rounded-full bg-success-soft px-2.5 text-caption text-success-fg">
        ৯২%
      </span>
    ),
    skeleton: <Skeleton className="h-7 w-14 rounded-full" />,
  },
];

export default function SkeletonsPage() {
  if (serverEnv().VERCEL_ENV === "production") notFound();
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-5">
      <h1 className="text-title-1">Skeletons</h1>
      <SkeletonBoard pairs={PAIRS} />
    </main>
  );
}
