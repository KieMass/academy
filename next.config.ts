import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle (node_modules pruned to
  // only what's actually required) — this is what the Dockerfile copies out.
  output: "standalone",
};

export default nextConfig;
