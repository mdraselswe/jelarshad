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

/** "২৫ অক্টো, সন্ধ্যা ৭টা": the hour in Bangladesh time, whatever the server's clock zone is. */
const HOUR = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "Asia/Dhaka",
  day: "numeric",
  month: "short",
  hour: "numeric",
});

/** "/food/দই" rather than its percent-encoded form; the raw path when it does not decode. */
function readablePath(path: string) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

/** One labelled bar per row, longest = the largest value. */
function BarList({
  title,
  head,
  rows,
}: {
  title: string;
  head: [string, string, string];
  rows: { key: string; label: string; views: number; sessions: number }[];
}) {
  const t = getT();
  const max = Math.max(1, ...rows.map((row) => row.views));
  return (
    <AdminCard>
      <p className="text-body font-semibold">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-2 text-meta text-muted-foreground">{t("admin.insightsNone")}</p>
      ) : (
        <table className="mt-2 w-full text-left text-meta">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 font-medium">{head[0]}</th>
              <th className="py-1 text-right font-medium">{head[1]}</th>
              <th className="py-1 text-right font-medium">{head[2]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-divider">
                <td className="py-1.5 pr-3">
                  <span className="block max-w-[28ch] truncate">{row.label}</span>
                  <span
                    aria-hidden
                    className="mt-1 block h-1.5 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (row.views / max) * 100)}%` }}
                  />
                </td>
                <td className="py-1.5 text-right font-semibold">{formatNumber(row.views)}</td>
                <td className="py-1.5 text-right">{formatNumber(row.sessions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminCard>
  );
}

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
        const [day, hourly, paths, week, month, searches, errors] = await Promise.all([
          insights.summary(daysAgo(1)),
          insights.hourly(daysAgo(1)),
          insights.topPaths(daysAgo(7), 15),
          insights.summary(daysAgo(7)),
          insights.summary(daysAgo(30)),
          insights.topSearches(daysAgo(7), 15),
          insights.recentErrors(20),
        ]);
        return (
          <>
            <p className="text-meta text-muted-foreground">{t("admin.insightsNote")}</p>
            <SummaryTable title={t("admin.insightsDay")} rows={day} />
            <BarList
              title={t("admin.insightsHourly")}
              head={[
                t("admin.insightsHour"),
                t("admin.insightsViews"),
                t("admin.insightsSessions"),
              ]}
              rows={hourly.map((row) => ({
                key: row.hour.toISOString(),
                label: HOUR.format(row.hour),
                views: row.views,
                sessions: row.sessions,
              }))}
            />
            <BarList
              title={t("admin.insightsTopPaths")}
              head={[
                t("admin.insightsPath"),
                t("admin.insightsViews"),
                t("admin.insightsSessions"),
              ]}
              rows={paths.map((row) => ({
                key: row.path,
                label: readablePath(row.path),
                views: row.views,
                sessions: row.sessions,
              }))}
            />
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
