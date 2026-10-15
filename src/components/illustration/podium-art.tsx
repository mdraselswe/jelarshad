import { cn } from "@/lib/cn";

// The contributors page's own scene: confetti that keeps falling, a crown that bobs, a trophy and
// sparkles. Inline SVG and CSS, decorative (aria-hidden), colors from --ill-* and reward tokens.
// Motion is transform and opacity only and stops under prefers-reduced-motion.

type ArtProps = { className?: string };

const CONFETTI = [
  { left: "6%", delay: "0s", duration: "5.2s", color: "var(--ill-spark-a)", size: 8 },
  { left: "14%", delay: "-1.8s", duration: "6.4s", color: "var(--ill-spark-b)", size: 6 },
  { left: "23%", delay: "-3.1s", duration: "5.8s", color: "var(--reward)", size: 7 },
  { left: "33%", delay: "-0.6s", duration: "6.9s", color: "var(--ill-spark-a)", size: 5 },
  { left: "42%", delay: "-4.2s", duration: "5.5s", color: "var(--ill-spark-b)", size: 8 },
  { left: "52%", delay: "-2.4s", duration: "6.2s", color: "var(--reward)", size: 6 },
  { left: "61%", delay: "-5.0s", duration: "7.1s", color: "var(--ill-spark-a)", size: 7 },
  { left: "70%", delay: "-1.2s", duration: "5.6s", color: "var(--ill-spark-b)", size: 5 },
  { left: "79%", delay: "-3.7s", duration: "6.6s", color: "var(--reward)", size: 8 },
  { left: "88%", delay: "-0.3s", duration: "5.9s", color: "var(--ill-spark-a)", size: 6 },
  { left: "95%", delay: "-4.6s", duration: "6.8s", color: "var(--ill-spark-b)", size: 7 },
] as const;

/** Paper confetti falling through the band it sits in (the band clips it). */
export function Confetti({ className }: ArtProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="absolute -top-3 block animate-fx-fall rounded-[2px]"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.6,
            background: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}

/** A crown for first place; it bobs a little. */
export function CrownArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 48 34" aria-hidden className={cn("animate-fx-bob", className)}>
      <path
        d="M4 28 1 8l12 10L24 2l11 16L47 8 44 28z"
        fill="var(--reward)"
        stroke="var(--on-reward)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="4" y="28" width="40" height="5" rx="2.5" fill="var(--ill-sun)" />
      <circle cx="24" cy="2" r="2.6" fill="var(--ill-spark-a)" />
      <circle cx="1" cy="8" r="2.2" fill="var(--ill-spark-b)" />
      <circle cx="47" cy="8" r="2.2" fill="var(--ill-spark-b)" />
    </svg>
  );
}

/** A trophy with twinkling sparkles, for the hero. */
export function TrophyArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 130" aria-hidden className={className}>
      <g className="animate-fx-float">
        <path
          d="M30 14h60v32c0 18-13 32-30 32S30 64 30 46z"
          fill="var(--reward)"
          stroke="var(--on-reward)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M30 24H14c0 16 6 26 18 28M90 24h16c0 16-6 26-18 28"
          fill="none"
          stroke="var(--on-reward)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M42 22c0 14 2 28 10 38"
          fill="none"
          stroke="var(--ill-sun-hi)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".75"
        />
        <rect
          x="52"
          y="78"
          width="16"
          height="16"
          fill="var(--ill-sun)"
          stroke="var(--on-reward)"
          strokeWidth="3"
        />
        <rect
          x="36"
          y="94"
          width="48"
          height="14"
          rx="5"
          fill="var(--reward)"
          stroke="var(--on-reward)"
          strokeWidth="3"
        />
      </g>
      <path
        className="animate-fx-twinkle"
        d="M104 8l2.6 7.6 7.6 2.6-7.6 2.6L104 28l-2.6-7.2-7.6-2.6 7.6-2.6z"
        fill="var(--ill-spark-a)"
      />
      <path
        className="animate-fx-twinkle [animation-delay:-1.3s]"
        d="M14 70l1.8 5.2 5.2 1.8-5.2 1.8L14 84l-1.8-5.2L7 77l5.2-1.8z"
        fill="var(--ill-spark-b)"
      />
      <path
        className="animate-fx-twinkle [animation-delay:-0.6s]"
        d="M110 86l1.4 4 4 1.4-4 1.4-1.4 4-1.4-4-4-1.4 4-1.4z"
        fill="var(--ill-spark-a)"
      />
    </svg>
  );
}
