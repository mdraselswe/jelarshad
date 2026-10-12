import { clientEnv } from "./env";

/** Site identity used by metadata, OG images, JSON-LD and the manifest. */
export const siteConfig = {
  name: "জেলার স্বাদ",
  nameLatin: "Jelar Shad",
  tagline: "জেলায় জেলায় আসল স্বাদের খোঁজ",
  description: "বাংলাদেশে কোথায় কী খাবেন — কমিউনিটির সত্যিকারের অভিজ্ঞতা থেকে।",
  /** Canonical origin without a trailing slash. */
  url: clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ""),
  locale: "bn_BD",
  /** Contact address for privacy requests; empty until the owner sets NEXT_PUBLIC_CONTACT_EMAIL. */
  contactEmail: clientEnv.NEXT_PUBLIC_CONTACT_EMAIL ?? null,
  /** Public social profiles; empty until they exist. */
  social: {} as Partial<Record<"facebook" | "instagram", string>>,
} as const;
