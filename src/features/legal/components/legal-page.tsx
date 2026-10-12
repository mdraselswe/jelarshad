import { BowlArt } from "@/components/illustration/food-art";
import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { SubPageBar } from "@/components/layout/sub-page-bar";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getT } from "@/i18n/server";

/** Plain text pages (আমাদের কথা, গোপনীয়তা ও নিয়ম): all content comes from the message files. */
export function LegalPage({ kind }: { kind: "about" | "policy" }) {
  const t = getT();
  const sections =
    kind === "about"
      ? ([
          [t("legal.about.sections.s1.h"), t("legal.about.sections.s1.p")],
          [t("legal.about.sections.s2.h"), t("legal.about.sections.s2.p")],
          [t("legal.about.sections.s3.h"), t("legal.about.sections.s3.p")],
          [t("legal.about.sections.s4.h"), t("legal.about.sections.s4.p")],
        ] as const)
      : ([
          [t("legal.policy.sections.s1.h"), t("legal.policy.sections.s1.p")],
          [t("legal.policy.sections.s2.h"), t("legal.policy.sections.s2.p")],
          [t("legal.policy.sections.s3.h"), t("legal.policy.sections.s3.p")],
          [t("legal.policy.sections.s4.h"), t("legal.policy.sections.s4.p")],
          [t("legal.policy.sections.s5.h"), t("legal.policy.sections.s5.p")],
        ] as const);
  const title = t(kind === "about" ? "legal.about.title" : "legal.policy.title");
  const lead = t(kind === "about" ? "legal.about.lead" : "legal.policy.lead");
  return (
    <PageShell header={<SubPageBar backHref={routes.home()} crumbs={[{ label: title }]} />}>
      <div className="max-w-3xl">
        <HeroBand tone="home" art={<BowlArt />}>
          <h1 className="text-title-1">{title}</h1>
          <p className="mt-3 text-body text-on-hero/90">{lead}</p>
        </HeroBand>
        <article className="flex flex-col gap-3 page-x pt-4 lg:pt-6">
          {sections.map(([heading, body]) => (
            <section key={heading} className="rounded-card-lg border border-border bg-card p-5">
              <h2 className="text-heading">{heading}</h2>
              <p className="mt-1.5 text-body leading-relaxed">{body}</p>
            </section>
          ))}
          {kind === "policy" && siteConfig.contactEmail ? (
            <p className="mt-2 text-body font-semibold">
              {t("legal.policy.contact", { email: siteConfig.contactEmail })}
            </p>
          ) : null}
        </article>
      </div>
    </PageShell>
  );
}
