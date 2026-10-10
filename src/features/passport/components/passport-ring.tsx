import { toBnDigits } from "@/lib/format/number";

/** Gold progress ring: how many of the districts have a stamp (docs/design/C-Passport). */
export function PassportRing({
  value,
  total,
  size = 72,
  stroke = 8,
  onReward = false,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  /** Drawn on the gold reward gradient: dark ring, light track. */
  onReward?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = total > 0 ? Math.min(1, value / total) : 0;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={onReward ? "stroke-white/60" : "stroke-muted"}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - filled)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={onReward ? "stroke-on-reward" : "stroke-reward"}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-xl font-bold">
        {toBnDigits(value)}
        <span
          className={`text-xs font-semibold ${onReward ? "opacity-80" : "text-muted-foreground"}`}
        >
          /{toBnDigits(total)}
        </span>
      </span>
    </span>
  );
}
