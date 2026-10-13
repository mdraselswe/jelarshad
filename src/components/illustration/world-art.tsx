import { cn } from "@/lib/cn";

// The living countryside (docs/06-design-system.md §2d): hills, a tree, a house with smoke, a boat on
// the water, a walking person, birds, a turning sun. Inline SVG, decorative (aria-hidden), colors
// from --ill-* tokens (the same in every theme: they sit on gradients). Motion is transform and
// opacity only and stops under prefers-reduced-motion.

type ArtProps = { className?: string };

/** A sun whose rays turn slowly. */
export function SunArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className={className}>
      <g className="origin-center animate-fx-spin [transform-box:fill-box]">
        {Array.from({ length: 10 }, (_, index) => (
          <rect
            key={index}
            x="38"
            y="2"
            width="4"
            height="12"
            rx="2"
            fill="var(--ill-sun-ray)"
            transform={`rotate(${index * 36} 40 40)`}
          />
        ))}
      </g>
      <circle cx="40" cy="40" r="19" fill="var(--ill-sun)" />
      <circle cx="34" cy="34" r="6" fill="var(--ill-sun-hi)" opacity=".7" />
    </svg>
  );
}

/** A tree that sways in the wind. */
export function TreeArt({ className, tone = "a" }: ArtProps & { tone?: "a" | "b" }) {
  return (
    <svg viewBox="0 0 60 80" aria-hidden className={className}>
      <rect x="27" y="44" width="6" height="32" rx="3" fill="var(--ill-trunk)" />
      <g className="origin-bottom animate-fx-sway [transform-box:fill-box]">
        <circle cx="30" cy="30" r="20" fill={`var(--ill-leaf-${tone})`} />
        <circle cx="19" cy="40" r="13" fill={`var(--ill-leaf-${tone})`} />
        <circle cx="41" cy="40" r="13" fill={`var(--ill-leaf-${tone})`} />
        <circle cx="24" cy="24" r="6" fill="var(--ill-leaf-hi)" opacity=".5" />
      </g>
    </svg>
  );
}

/** A coconut palm: a curved trunk and a crown of fronds that wave. */
export function PalmArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 70 90" aria-hidden className={className}>
      <path
        d="M32 88c2-22 0-40 8-60"
        stroke="var(--ill-trunk)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <g className="origin-bottom animate-fx-sway [transform-box:fill-box]">
        <path d="M40 28C26 12 12 20 6 30c12-6 22-4 34-2z" fill="var(--ill-leaf-a)" />
        <path d="M40 28C48 8 62 8 68 18c-12-2-20 2-28 10z" fill="var(--ill-leaf-b)" />
        <path d="M40 28C30 26 20 36 18 48c10-10 16-14 22-20z" fill="var(--ill-leaf-b)" />
        <path d="M40 28c10 2 18 12 18 24-8-10-14-14-18-24z" fill="var(--ill-leaf-a)" />
        <circle cx="38" cy="32" r="3.5" fill="var(--ill-trunk)" />
        <circle cx="44" cy="31" r="3.5" fill="var(--ill-trunk)" />
      </g>
    </svg>
  );
}

/** A village house: tin roof, a door, a window that glows, smoke from the kitchen. */
export function HouseArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 90 80" aria-hidden className={className}>
      <g fill="none" stroke="var(--ill-smoke)" strokeWidth="4" strokeLinecap="round" opacity=".9">
        <path className="animate-fx-steam" d="M66 20c-6-6 6-8 0-16" />
        <path className="animate-fx-steam [animation-delay:1.2s]" d="M74 22c-6-6 6-8 0-16" />
      </g>
      <rect x="62" y="22" width="8" height="16" fill="var(--ill-wall-dark)" />
      <rect x="12" y="38" width="66" height="36" rx="3" fill="var(--ill-wall)" />
      <path d="M6 42 45 14l39 28z" fill="var(--ill-roof)" />
      <rect x="38" y="52" width="14" height="22" rx="3" fill="var(--ill-door)" />
      <rect
        x="18"
        y="48"
        width="14"
        height="12"
        rx="2"
        fill="var(--ill-window)"
        className="animate-fx-twinkle"
      />
      <rect
        x="58"
        y="48"
        width="14"
        height="12"
        rx="2"
        fill="var(--ill-window)"
        className="animate-fx-twinkle [animation-delay:-1.3s]"
      />
    </svg>
  );
}

/** A country boat that rocks on the water. */
export function BoatArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 100 60" aria-hidden className={className}>
      <g className="origin-bottom animate-fx-bob [transform-box:fill-box]">
        <path d="M49 6v30" stroke="var(--ill-trunk)" strokeWidth="3" strokeLinecap="round" />
        <path d="M51 8c14 6 22 16 24 26H51z" fill="var(--ill-sail)" />
        <path d="M47 14c-8 4-14 12-16 20h16z" fill="var(--ill-sail-b)" />
        <path d="M10 38h80c-4 12-14 18-26 18H36c-12 0-22-6-26-18z" fill="var(--ill-boat)" />
        <path d="M16 44h68" stroke="var(--ill-boat-hi)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** A person walking along: legs swing, the bag bobs. Wears one of three shirt colors. */
export function PersonArt({
  className,
  shirt = "a",
  walking = true,
}: ArtProps & { shirt?: "a" | "b" | "c"; walking?: boolean }) {
  return (
    <svg viewBox="0 0 40 80" aria-hidden className={className}>
      <g className={walking ? "origin-bottom animate-fx-step [transform-box:fill-box]" : undefined}>
        <circle cx="20" cy="12" r="8" fill="var(--ill-skin)" />
        <path d="M12 10a8 8 0 0 1 16 0c-4-4-12-4-16 0z" fill="var(--ill-hair)" />
        <rect x="11" y="22" width="18" height="26" rx="8" fill={`var(--ill-shirt-${shirt})`} />
        <rect
          x="13"
          y="46"
          width="6"
          height="26"
          rx="3"
          fill="var(--ill-trousers)"
          className={walking ? "origin-top animate-fx-leg [transform-box:fill-box]" : undefined}
        />
        <rect
          x="21"
          y="46"
          width="6"
          height="26"
          rx="3"
          fill="var(--ill-trousers)"
          className={walking ? "origin-top animate-fx-leg-b [transform-box:fill-box]" : undefined}
        />
      </g>
    </svg>
  );
}

/** A bird that crosses the sky with beating wings. */
export function BirdArt({ className, delay = 0 }: ArtProps & { delay?: number }) {
  return (
    <svg
      viewBox="0 0 30 16"
      aria-hidden
      className={cn("animate-fx-fly", className)}
      style={{ animationDelay: `${-delay}ms` }}
    >
      <path
        className="origin-center animate-fx-flap [transform-box:fill-box]"
        d="M2 10C8 0 12 2 15 8c3-6 7-8 13 2"
        fill="none"
        stroke="var(--ill-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Rolling hills in three layers (back to front); the front one holds the ground color. */
function HillLayers({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden className={className}>
      <path d="M0 62C50 24 110 30 170 56S300 36 400 14V100H0z" fill="var(--ill-hill-far)" />
      <path d="M0 76C70 42 130 58 200 70S330 54 400 40V100H0z" fill="var(--ill-hill-mid)" />
      <path d="M0 90C80 70 150 82 220 88S340 76 400 70V100H0z" fill="var(--ill-hill-near)" />
    </svg>
  );
}

/** Two layers of water that slide against each other, with light flecks. */
function WaterLayers({ className }: ArtProps) {
  const path =
    "M0 12Q25 0 50 12T100 12T150 12T200 12T250 12T300 12T350 12T400 12T450 12T500 12T550 12T600 12T650 12T700 12T750 12T800 12V60H0z";
  return (
    <div aria-hidden className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-x-0 top-0 w-[200%] animate-fx-wave-b opacity-70">
        <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="block h-full w-full">
          <path d={path} fill="var(--ill-water-far)" />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-2 w-[200%] animate-fx-wave">
        <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="block h-full w-full">
          <path d={path} fill="var(--ill-water)" />
        </svg>
      </div>
    </div>
  );
}

/**
 * A strip of countryside to stand on the bottom edge of a band: sun, clouds and birds in the sky,
 * hills, trees, a house with smoke and someone walking. `scene` picks the mood; the strip is a fixed
 * 120px high so a band never changes height.
 */
export function WorldStrip({
  scene = "hills",
  className,
}: {
  scene?: "hills" | "river" | "village";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none relative h-[120px] w-full overflow-hidden", className)}
    >
      <SunArt className="absolute top-1 right-6 w-12 opacity-95" />
      <svg
        viewBox="0 0 120 50"
        className="absolute top-3 left-[8%] w-20 animate-fx-drift opacity-80"
      >
        <path
          d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-4 16 16 0 0 1 30 8 12 12 0 0 1 8 23z"
          fill="var(--ill-cloud)"
        />
      </svg>
      <svg
        viewBox="0 0 120 50"
        className="absolute top-8 left-[46%] w-14 animate-fx-drift-b opacity-70"
      >
        <path
          d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-4 16 16 0 0 1 30 8 12 12 0 0 1 8 23z"
          fill="var(--ill-cloud)"
        />
      </svg>
      <BirdArt className="absolute top-5 left-[30%] w-6" />
      <BirdArt className="absolute top-9 left-[34%] w-4" delay={900} />
      {scene === "river" ? (
        <>
          <HillLayers className="absolute inset-x-0 bottom-6 h-16 w-full" />
          <WaterLayers className="absolute inset-x-0 bottom-0 h-10" />
          <BoatArt className="absolute bottom-3 left-[38%] w-16" />
          <PalmArt className="absolute bottom-6 left-[6%] w-10" />
        </>
      ) : (
        <>
          <HillLayers className="absolute inset-x-0 bottom-0 h-20 w-full" />
          <TreeArt className="absolute bottom-3 left-[6%] w-10" />
          <TreeArt tone="b" className="absolute bottom-4 left-[16%] w-7" />
          <HouseArt className="absolute bottom-3 left-[44%] w-16" />
          {scene === "village" ? <PalmArt className="absolute bottom-4 left-[68%] w-9" /> : null}
          <PersonArt shirt="b" className="absolute bottom-2 left-[78%] h-14 w-7" />
        </>
      )}
    </div>
  );
}

/** Rolling hills with a few swaying trees along the top edge of a band (drawn in the band color). */
export function HillEdge({ className }: ArtProps) {
  return (
    <div aria-hidden className={cn("h-[30px] overflow-hidden", className)}>
      <svg
        viewBox="0 0 400 30"
        preserveAspectRatio="none"
        className="block h-[30px] w-full fill-current"
      >
        <path d="M0 30V20C30 8 60 6 100 14S170 24 220 14 320 0 400 12V30z" />
      </svg>
    </div>
  );
}

const TREE_SPOTS = [4, 13, 22, 31, 40, 49, 58, 67, 76, 85, 93] as const;

/** A row of small trees along the top edge of a band; each sways on its own beat. */
export function TreeEdge({ className }: ArtProps) {
  return (
    <div aria-hidden className={cn("relative h-[30px] overflow-hidden", className)}>
      <svg
        viewBox="0 0 400 30"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 block h-[10px] w-full fill-current"
      >
        <rect width="400" height="30" />
      </svg>
      {TREE_SPOTS.map((left, index) => (
        <svg
          key={left}
          viewBox="0 0 20 30"
          className="absolute bottom-[8px] w-[18px] origin-bottom animate-fx-sway fill-current"
          style={{ left: `${left}%`, animationDelay: `${-index * 480}ms` }}
        >
          <rect x="9" y="18" width="3" height="12" />
          <circle cx="10.5" cy={index % 2 === 0 ? 11 : 13} r={index % 3 === 0 ? 9 : 7} />
        </svg>
      ))}
    </div>
  );
}
