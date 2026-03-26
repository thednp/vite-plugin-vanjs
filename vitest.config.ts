import { defineConfig, Plugin } from "vitest/config";
import vanjs from "vite-plugin-vanjs";

export default defineConfig({
  plugins: [vanjs({ routesDir: "tests/routes" }) ],
  test: {
    globals: true,
    include: [
      "tests/**.test.tsx",
      "tests/**.test.ts"
    ],
    coverage: {
      provider: "istanbul",
      reporter: ["html", "text", "lcov"],
      enabled: true,
      include: [
        "plugin/*.[mjs|ts]",
        "meta/*.[mjs|ts]",
        "router/.[mjs|ts]*",
        "setup/*.[mjs|ts]",
        "client/*.[mjs|ts]",
        "server/*.[mjs|ts]",
        "jsx/*.[mjs|ts]",
        // "parser/*.[mjs|ts]",
      ],
      // exclude: ["*.json"]
    },
  },
});
