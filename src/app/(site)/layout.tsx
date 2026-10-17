import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopNav } from "@/components/layout/desktop-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { LazyPwa } from "@/features/pwa/components/lazy-pwa";

// App pages: phones/tablets get the content column + floating bottom nav; from 1024px a top bar
// replaces both the mobile header and the bottom nav (docs/design/desktop).
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PageViewTracker />
      <DesktopNav />
      {children}
      <SiteFooter />
      <BottomNav />
      <LazyPwa />
    </>
  );
}
