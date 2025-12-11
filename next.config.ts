import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is the default in Next.js 16
  turbopack: {
    resolveAlias: {
      // Ensure @noble/hashes subpath exports are resolved correctly
      "@noble/hashes/sha2": "@noble/hashes/sha2.js",
    },
  },
};

export default nextConfig;
