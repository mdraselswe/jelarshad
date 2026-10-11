import { Section } from "@/components/layout/section";
import { getT } from "@/i18n/server";
import { cn } from "@/lib/cn";

const STEPS = [
  { n: "১", h: "home.how.s1.h", p: "home.how.s1.p", tone: "bg-primary-soft text-primary-soft-fg" },
  { n: "২", h: "home.how.s2.h", p: "home.how.s2.p", tone: "bg-reward-soft text-reward-soft-fg" },
  { n: "৩", h: "home.how.s3.h", p: "home.how.s3.p", tone: "bg-success-soft text-success-fg" },
] as const;

/** Desktop side panel next to the famous list: what to do here, in three steps. */
export function HomeHow() {
  const t = getT();
  return (
    <Section title={t("home.howTitle")} className="hidden lg:block">
      <ol className="flex flex-col gap-[18px] rounded-card-lg border border-border bg-card p-[22px] shadow-card">
        {STEPS.map((step) => (
          <li key={step.n} className="flex items-start gap-3.5">
            <span
              aria-hidden
              className={cn(
                "flex size-[42px] shrink-0 items-center justify-center rounded-[14px] font-display text-lg font-bold",
                step.tone,
              )}
            >
              {step.n}
            </span>
            <span>
              <span className="block text-card-title">{t(step.h)}</span>
              <span className="block text-meta text-muted-foreground">{t(step.p)}</span>
            </span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
