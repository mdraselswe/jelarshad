import type { NextConfig } from "next";

// Validates the environment at build/start time: a missing or invalid variable fails here.
import { validateBuildEnv } from "./src/config/env";
import { securityHeaders } from "./src/config/security-headers";

validateBuildEnv();

const nextConfig: NextConfig = {
  // 'use cache' + cacheTag/cacheLife for catalog reads (docs/03-architecture.md §8).
  cacheComponents: true,
  // HarfBuzz (WASM) loads its own binary from node_modules; bundling it breaks that lookup.
  serverExternalPackages: ["harfbuzzjs"],
  // Share cards read their Bangla fonts from disk (Satori cannot use WOFF2); make sure the files
  // are part of the deployed functions.
  outputFileTracingIncludes: {
    "/**/opengraph-image*": ["./src/features/share/fonts/**"],
  },
  async headers() {
    // Font files never change in place (rename on update), so browsers may cache them for a year.
    return [
      {
        source: "/:path*",
        headers: securityHeaders({ production: process.env.NODE_ENV === "production" }),
      },
      {
        source: "/fonts/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
