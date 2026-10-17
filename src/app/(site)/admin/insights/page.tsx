import type { Metadata } from "next";

import { AdminButton } from "@/features/admin/components/admin-button";
import { AdminCard, AdminFrame } from "@/features/admin/components/admin-frame";
import { getT } from "@/i18n/server";
import { getServices } from "@/infrastructure/container";
import { formatNumber } from "@/lib/format/number";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("admin.sections.insights"),
  description: getT()("admin.title"),
  path: "/admin/insights",
  noindex: true,
});

const DAY = 86_400_000;
const RETENTION_DAYS = 90;

/** Event names in the order an admin cares about; any other name is listed after them. */
const ORDER = [
  "page_view",
  "search",
  "experience_added",
  "place_added",
  "claim_voted",
  "share",
] as const;
type Known = (typeof ORDER)[number];
const isKnown = (name: string): name is Known => (ORDER as readonly string[]).includes(name);

/** A date this many days back; a function of its own so the page body stays free of clock reads. */
const daysAgo = (days: number) => new Date(Date.now() - days * DAY);

type Row = { name: string; events: number; sessions: number };

function SummaryTable({ title, rows }: { title: string; rows: Row[] }) {
  const t = getT();
  const rank = (name: string) => {
    const index = (ORDER as readonly string[]).indexOf(name);
    return index === -1 ? ORDER.length : index;
  };
  const sorted = [...rows].sort((a, b) => rank(a.name) - rank(b.name));
  return (
    <AdminCard>
      <p className="text-body font-semibold">{title}</p>
      {sorted.length === 0 ? (
        <p className="mt-2 text-meta text-muted-foreground">{t("admin.insightsNone")}</p>
      ) : (
        <table className="mt-2 w-full text-left text-meta">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 font-medium">{t("admin.insightsEvent")}</th>
              <th className="py-1 text-right font-medium">{t("admin.insightsCount")}</th>
              <th className="py-1 text-right font-medium">{t("admin.insightsSessions")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.name} className="border-t border-divider">
                <td className="py-1.5">
                  {isKnown(row.name) ? t(`admin.events.${row.name}`) : row.name}
                </td>
                <td className="py-1.5 text-right font-semibold">{formatNumber(row.events)}</td>
                <td className="py-1.5 text-right">{formatNumber(row.sessions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminCard>
  );
}

export default function AdminInsights() {
  return (
    <AdminFrame section="insights">
      {async () => {
        const t = getT();
        const { insights } = getServices().repos;
        const [week, month, searches, errors] = await Promise.all([
          insights.summary(daysAgo(7)),
          insights.summary(daysAgo(30)),
          insights.topSearches(daysAgo(7), 15),
          insights.recentErrors(20),
        ]);
        return (
          <>
            <SummaryTable title={t("admin.insightsWeek")} rows={week} />
            <SummaryTable title={t("admin.insightsMonth")} rows={month} />
            <AdminCard>
              <p className="text-body font-semibold">{t("admin.insightsSearches")}</p>
              {searches.length === 0 ? (
                <p className="mt-2 text-meta text-muted-foreground">{t("admin.insightsNone")}</p>
              ) : (
                <ul className="mt-2 divide-y divide-divider text-meta">
                  {searches.map((row) => (
                    <li key={row.query} className="flex items-center justify-between gap-3 py-1.5">
                      <span className="min-w-0 flex-1 truncate">{row.query}</span>
                      <span className="shrink-0 font-semibold">{formatNumber(row.searches)}</span>
                      {row.empty > 0 ? (
                        <span className="shrink-0 text-danger-fg">
                          {t("admin.insightsEmpty", { count: formatNumber(row.empty) })}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>
            <AdminCard>
              <p className="text-body font-semibold">{t("admin.insightsErrors")}</p>
              {errors.length === 0 ? (
                <p className="mt-2 text-meta text-muted-foreground">
                  {t("admin.insightsNoErrors")}
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-divider text-meta">
                  {errors.map((row, index) => (
                    <li key={index} className="py-2">
                      <p className="font-semibold break-words">{row.message}</p>
                      <p className="text-caption text-muted-foreground">
                        {row.at.toISOString().slice(0, 16).replace("T", " ")} UTC ·{" "}
                        {t(`admin.errorSource.${row.source}`)}
                        {row.path ? ` · ${row.path}` : ""}
                        {row.digest ? ` · ${row.digest}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>
            <AdminCard>
              <p className="text-body font-semibold">
                {t("admin.insightsPurgeTitle", { days: formatNumber(RETENTION_DAYS) })}
              </p>
              <p className="mt-1 text-meta text-muted-foreground">{t("admin.insightsPurgeHint")}</p>
              <div className="mt-3">
                <AdminButton payload={{ kind: "purge-insights" }}>{t("admin.run")}</AdminButton>
              </div>
            </AdminCard>
          </>
        );
      }}
    </AdminFrame>
  );
}
