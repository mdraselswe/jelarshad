import { cn } from "@/lib/cn";

// One full wave is 195 units; the path holds eight of them, shown at 200% width and shifted by half,
// so the loop is seamless at any container width.
const PATH =
  "M0 14Q48.75 0 97.5 14T195 14T292.5 14T390 14T487.5 14T585 14T682.5 14T780 14T877.5 14T975 14T1072.5 14T1170 14T1267.5 14T1365 14T1462.5 14T1560 14V28H0z";

/**
 * The slowly moving wave on the top edge of a band (docs/06-design-system.md §2d). It is drawn in the
 * text color of its container, so give it the band's color: `text-band-teal`.
 */
export function WaveDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("h-[30px] overflow-hidden", className)}>
      <div className="w-[200%] animate-fx-wave">
        <svg
          viewBox="0 0 1560 28"
          preserveAspectRatio="none"
          className="block h-[30px] w-full fill-current"
        >
          <path d={PATH} />
        </svg>
      </div>
    </div>
  );
}
