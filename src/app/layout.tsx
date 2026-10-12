import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";

import { ThemeScript } from "@/components/theme/theme-script";
import { LazyToaster } from "@/components/ui/lazy-toaster";
import { LazyRewardMoment } from "@/features/reward/lazy-reward-moment";
import { FONT_PRELOADS } from "@/config/fonts";
import { siteConfig } from "@/config/site";
import { themes } from "@/config/themes";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Both variants so "system" follows the OS; useTheme() rewrites them when the user picks a theme.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themes.light.metaColor },
    { media: "(prefers-color-scheme: dark)", color: themes.dark.metaColor },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  for (const href of FONT_PRELOADS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  return (
    // data-theme is set before paint by <ThemeScript />, so the server markup legitimately differs.
    <html lang="bn" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh">
        {children}
        <LazyToaster />
        <LazyRewardMoment />
      </body>
    </html>
  );
}
