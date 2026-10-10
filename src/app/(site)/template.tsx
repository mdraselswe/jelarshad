// A template (unlike a layout) mounts again on every navigation, so each page slides up into place.
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
