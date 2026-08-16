import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server bundle (node_modules pruned to
  // only what's actually required) — this is what the Dockerfile copies out.
  // Vercel has its own build/output pipeline and this setting breaks it there
  // (ENOENT on .next/next-server.js.nft.json), so only enable it off-Vercel.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
