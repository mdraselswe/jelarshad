import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BirdArt,
  BoatArt,
  HillEdge,
  HouseArt,
  PalmArt,
  PersonArt,
  SunArt,
  TreeArt,
  TreeEdge,
  WorldStrip,
} from "@/components/illustration/world-art";
import { serverEnv } from "@/config/env";

// Dev-only gallery of the living countryside illustrations (see world-art.tsx).
export const metadata: Metadata = { title: "World", robots: { index: false } };

export default function WorldGallery() {
  if (serverEnv().VERCEL_ENV === "production") notFound();
  const singles = [
    ["Sun", <SunArt key="s" className="w-20" />],
    ["Tree", <TreeArt key="t" className="w-16" />],
    ["Palm", <PalmArt key="p" className="w-16" />],
    ["House", <HouseArt key="h" className="w-24" />],
    ["Boat", <BoatArt key="b" className="w-24" />],
    ["Person", <PersonArt key="pe" className="h-20 w-10" />],
    ["Bird", <BirdArt key="bi" className="w-10" />],
  ] as const;
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-5">
      <h1 className="text-title-1">World</h1>
      <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {singles.map(([name, art]) => (
          <li
            key={name}
            className="flex h-32 flex-col items-center justify-end gap-2 rounded-card-lg bg-grad-hero p-3 text-on-hero"
          >
            {art}
            <span className="text-caption">{name}</span>
          </li>
        ))}
      </ul>
      {(["hills", "river", "village"] as const).map((scene) => (
        <div key={scene} className="overflow-hidden rounded-card-lg bg-grad-district">
          <WorldStrip scene={scene} />
        </div>
      ))}
      <div className="text-band-teal">
        <HillEdge />
        <div className="h-8 bg-band-teal" />
      </div>
      <div className="text-band-warm">
        <TreeEdge />
        <div className="h-8 bg-band-warm" />
      </div>
    </main>
  );
}
