import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { LeaderboardPage } from "@/features/leaderboard/components/leaderboard-page";
import { getT } from "@/i18n/server";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: getT()("leaderboard.title"),
  description: getT()("leaderboard.lead"),
  path: routes.leaderboard(),
});

export default function Page() {
  return <LeaderboardPage />;
}
