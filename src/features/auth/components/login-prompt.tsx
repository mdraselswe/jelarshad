import { HeroBand } from "@/components/layout/hero-band";
import { PageShell } from "@/components/layout/page-shell";
import { routes } from "@/config/routes";
import { getT } from "@/i18n/server";

/**
 * Asks for Google sign-in. A plain link to the sign-in route: no JavaScript needed, and the browser
 * leaves the site exactly as it does for any OAuth button.
 */
export function LoginPrompt({ next, failed = false }: { next: string; failed?: boolean }) {
  const t = getT();
  return (
    <PageShell>
      <div className="lg:max-w-xl">
        <HeroBand tone="home" className="lg:p-10">
          <h1 className="text-title-1">{t("auth.loginTitle")}</h1>
          <p className="mt-2 text-body text-on-hero/90">{t("auth.loginBody")}</p>
        </HeroBand>
      </div>
      <section className="page-x pt-5 lg:max-w-xl">
        {failed ? (
          <p
            role="alert"
            className="mt-3 rounded-input bg-danger-soft px-3.5 py-2.5 text-meta text-danger-fg"
          >
            {t("auth.loginError")}
          </p>
        ) : null}
        <a
          href={routes.signIn(next)}
          className="flex h-14 press items-center justify-center rounded-button bg-primary bg-grad-action px-5 text-[17px] font-semibold text-primary-foreground"
        >
          {t("auth.google")}
        </a>
      </section>
    </PageShell>
  );
}
