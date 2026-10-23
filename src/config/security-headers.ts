// Security headers for every response (next.config.ts). Kept in one module so a test can check them.
//
// The content security policy allows only this site plus the hosts the app really talks to:
// Cloudinary (photo uploads and delivery), Google and Facebook (profile photos after sign-in) and
// Supabase. Scripts and styles may be inline because Next.js streams its page data in inline
// scripts and the theme script runs before paint; everything else (framing, plugins, foreign
// forms, foreign scripts) is refused.

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.googleusercontent.com https://*.fbcdn.net https://platform-lookaside.fbsbx.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.cloudinary.com https://*.supabase.co",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

export function securityHeaders(options: { production: boolean }) {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Location is used by "near me" on this site only; nothing else is ever asked for.
    {
      key: "Permissions-Policy",
      value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()",
    },
  ];
  // The development server needs eval for fast refresh, so the policy is only sent by a production
  // build (Vercel and the CI end-to-end run, which tests the app with it).
  return options.production
    ? [...headers, { key: "Content-Security-Policy", value: CSP }]
    : headers;
}
