import { cn } from "@/lib/cn";

// Small live illustrations (docs/06-design-system.md §2d): inline SVG, a few hundred bytes each,
// decorative (aria-hidden). Colors come from the --ill-* tokens; motion is transform/opacity only and
// stops under prefers-reduced-motion. Put them on gradients and bands, never in running text.

type ArtProps = { className?: string };

/** A bowl of rice with three wisps of steam. */
export function BowlArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 140 120" aria-hidden className={cn("animate-fx-float", className)}>
      <g fill="none" strokeWidth="4" strokeLinecap="round" opacity=".9" stroke="var(--ill-steam)">
        <path className="animate-fx-steam" d="M52 40c-7-9 7-14 0-24" />
        <path className="animate-fx-steam [animation-delay:.8s]" d="M70 42c-7-9 7-14 0-26" />
        <path className="animate-fx-steam [animation-delay:1.6s]" d="M88 40c-7-9 7-14 0-24" />
      </g>
      <path d="M28 60a42 26 0 0 1 84 0z" fill="var(--ill-rice)" />
      <circle cx="50" cy="52" r="2" fill="var(--ill-grain)" />
      <circle cx="70" cy="47" r="2" fill="var(--ill-grain)" />
      <circle cx="90" cy="53" r="2" fill="var(--ill-grain)" />
      <path d="M14 62h112a56 48 0 0 1-112 0z" fill="var(--ill-bowl)" />
      <path
        d="M26 72h88"
        stroke="var(--ill-bowl-hi)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".7"
      />
    </svg>
  );
}

/** A cup of tea. */
export function CupArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className={cn("animate-fx-float-b", className)}>
      <g fill="none" strokeWidth="3.5" strokeLinecap="round" opacity=".9" stroke="var(--ill-steam)">
        <path className="animate-fx-steam" d="M26 26c-5-6 5-9 0-16" />
        <path className="animate-fx-steam [animation-delay:1s]" d="M40 26c-5-6 5-9 0-16" />
      </g>
      <path d="M12 34h42v12a18 18 0 0 1-18 18h-6a18 18 0 0 1-18-18z" fill="var(--ill-cup)" />
      <path
        d="M54 38h4a7 7 0 0 1 0 14h-5"
        fill="none"
        stroke="var(--ill-cup)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Two sweets on a plate. */
export function SweetArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 80 60" aria-hidden className={cn("animate-fx-float-c", className)}>
      <ellipse cx="40" cy="48" rx="32" ry="8" fill="var(--ill-plate)" />
      <circle cx="27" cy="34" r="14" fill="var(--ill-sweet)" />
      <circle cx="50" cy="32" r="15" fill="var(--ill-rice)" />
      <path
        d="M20 30a8 8 0 0 1 6-6"
        stroke="var(--ill-plate)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** A fish (ilish). */
export function FishArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 90 50" aria-hidden className={cn("animate-fx-float-b", className)}>
      <path d="M6 26c16-20 44-20 60 0-16 20-44 20-60 0z" fill="var(--ill-fish)" />
      <path d="M66 26l16-14v28z" fill="var(--ill-fish-fin)" />
      <circle cx="20" cy="22" r="3" fill="var(--ill-ink)" />
      <path
        d="M30 14c6 8 6 14 0 24"
        stroke="var(--ill-fish-fin)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A clay pot of doi with steam-like wisps (district and food cards). */
export function PotArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={cn("animate-fx-float", className)}>
      <path d="M10 30h40a20 20 0 0 1-40 0z" fill="var(--ill-sweet)" />
      <g fill="none" strokeWidth="3" strokeLinecap="round" opacity=".75" stroke="var(--ill-steam)">
        <path className="animate-fx-steam" d="M16 24c0-6 10-6 10-12" />
        <path className="animate-fx-steam [animation-delay:1s]" d="M32 24c0-6 10-6 10-12" />
      </g>
    </svg>
  );
}

/** A plate of kacchi-style rice. */
export function PlateArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={cn("animate-fx-float-b", className)}>
      <path d="M8 34h44a22 18 0 0 1-44 0z" fill="var(--ill-sweet)" />
      <path d="M14 30a16 12 0 0 1 32 0z" fill="var(--ill-gold-hi)" />
    </svg>
  );
}

/** A small pile of sweets (mezban and platter cards). */
export function PileArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={cn("animate-fx-float-c", className)}>
      <ellipse cx="30" cy="40" rx="22" ry="8" fill="var(--ill-sweet)" />
      <circle cx="20" cy="32" r="8" fill="var(--ill-bowl-hi)" opacity=".85" />
      <circle cx="34" cy="30" r="9" fill="var(--ill-gold-hi)" />
      <circle cx="44" cy="35" r="6" fill="var(--ill-bowl-hi)" opacity=".85" />
    </svg>
  );
}

/** A map pin that hops. */
export function PinArt({
  className,
  tone = "a",
  delay = 0,
}: ArtProps & { tone?: "a" | "b" | "c"; delay?: number }) {
  return (
    <svg
      viewBox="0 0 24 30"
      aria-hidden
      className={cn("animate-fx-pin", className)}
      style={{ animationDelay: `${-delay}ms` }}
    >
      <path
        d="M12 1a9 9 0 0 0-9 9c0 7 9 18 9 18s9-11 9-18a9 9 0 0 0-9-9z"
        fill={`var(--ill-pin-${tone})`}
      />
      <circle cx="12" cy="10" r="3.5" fill="var(--ill-steam)" />
    </svg>
  );
}

/** A dotted path that keeps moving ("journey" between districts). */
export function RouteArt({ className, tone = "steam" }: ArtProps & { tone?: "steam" | "gold" }) {
  return (
    <svg viewBox="0 0 360 70" aria-hidden preserveAspectRatio="none" className={className}>
      <path
        className="animate-fx-route"
        d="M6 54C58 6 110 74 170 36S290 56 354 14"
        fill="none"
        stroke={tone === "gold" ? "var(--ill-gold)" : "var(--ill-steam)"}
        strokeWidth="3"
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A four-point sparkle that twinkles. */
export function SparkleArt({
  className,
  tone = "a",
  delay = 0,
}: ArtProps & { tone?: "a" | "b"; delay?: number }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={cn("animate-fx-twinkle", className)}
      style={{ animationDelay: `${-delay}ms` }}
    >
      <path
        d="M6 0l1.4 4.6L12 6 7.4 7.4 6 12 4.6 7.4 0 6l4.6-1.4z"
        fill={`var(--ill-spark-${tone})`}
      />
    </svg>
  );
}

/** A trophy that floats. */
export function TrophyArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 80 90" aria-hidden className={cn("animate-fx-float-b", className)}>
      <path d="M22 8h36v26a18 18 0 0 1-36 0z" fill="var(--ill-gold)" />
      <path
        d="M22 14H10v6a12 12 0 0 0 12 12M58 14h12v6a12 12 0 0 1-12 12"
        stroke="var(--ill-gold)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="34" y="52" width="12" height="14" fill="var(--ill-gold)" />
      <rect x="24" y="66" width="32" height="10" rx="4" fill="var(--ill-gold-hi)" />
      <path
        d="M30 16v16"
        stroke="var(--ill-steam)"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".6"
      />
    </svg>
  );
}

/** A magnifying glass that searches (empty search results). */
export function MagnifierArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden className={className}>
      <circle cx="80" cy="64" r="46" fill="var(--primary-soft)" />
      <path d="M40 90h80" stroke="var(--border)" strokeWidth="6" strokeLinecap="round" />
      <g className="animate-fx-scan">
        <circle
          cx="76"
          cy="58"
          r="22"
          fill="var(--card)"
          fillOpacity=".7"
          stroke="var(--primary)"
          strokeWidth="6"
        />
        <path d="M92 74l20 20" stroke="var(--primary)" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * "Nothing found": an empty plate with a magnifier hunting over it, a question mark that floats and
 * a few sparkles. Uses ground tokens, so it reads on a white card in both themes.
 */
export function NotFoundArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 220 160" aria-hidden className={className}>
      <circle cx="110" cy="84" r="62" fill="var(--primary-soft)" />
      <ellipse cx="110" cy="118" rx="54" ry="10" fill="var(--border)" />
      <g className="animate-fx-float-b">
        <ellipse
          cx="110"
          cy="96"
          rx="46"
          ry="16"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="3"
        />
        <ellipse cx="110" cy="96" rx="30" ry="9" fill="var(--primary-soft)" />
      </g>
      <g className="animate-fx-float">
        <circle cx="168" cy="38" r="17" fill="var(--reward)" />
        <path
          d="M162 34a6.5 6.5 0 1 1 9 6c-2 1-3 2.200-3 4.500M168 51h.01"
          fill="none"
          stroke="var(--reward-foreground)"
          strokeWidth="3.500"
          strokeLinecap="round"
        />
      </g>
      <g className="animate-fx-scan">
        <circle
          cx="96"
          cy="70"
          r="22"
          fill="var(--card)"
          fillOpacity=".75"
          stroke="var(--primary)"
          strokeWidth="6"
        />
        <path d="M112 86l20 20" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round" />
      </g>
      <g className="animate-fx-twinkle">
        <path
          d="M40 40l2.400 7.600L50 50l-7.600 2.400L40 60l-2.400-7.600L30 50l7.600-2.400z"
          fill="var(--reward)"
        />
      </g>
      <g className="animate-fx-twinkle [animation-delay:-1.3s]">
        <path
          d="M190 112l1.800 5.700 5.700 1.800-5.700 1.800L190 127l-1.800-5.700-5.700-1.800 5.700-1.800z"
          fill="var(--primary)"
        />
      </g>
    </svg>
  );
}

/** Cloud that drifts across a hero. */
export function CloudArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 120 50" aria-hidden className={cn("animate-fx-drift", className)}>
      <path
        d="M20 40a14 14 0 0 1 4-27 20 20 0 0 1 38-4 16 16 0 0 1 30 8 12 12 0 0 1 8 23z"
        fill="var(--ill-steam)"
      />
    </svg>
  );
}
