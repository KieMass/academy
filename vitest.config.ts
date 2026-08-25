import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Next.js's bundler no-ops `server-only` for real server code (it
      // only throws if accidentally pulled into a client bundle); vitest
      // has no such distinction, so without this alias every test that
      // transitively imports a file with `import "server-only"` fails to
      // resolve — see tests/unit/mocks/server-only.ts.
      "server-only": path.resolve(__dirname, "./tests/unit/mocks/server-only.ts"),
    },
  },
});
