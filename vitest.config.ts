import { defineConfig } from "vitest/config";
import vanjs from "vite-plugin-vanjs";

export default defineConfig({
  plugins: [vanjs({ routesDir: "tests/routes" })],
  test: {
    // globals: true,
    include: [
      "tests/**.test.?(c|m)[jt]s?(x)",
    ],
    coverage: {
      provider: "istanbul",
      reporter: ["html", "text", "lcov"],
      enabled: true,
      include: [
        "plugin/*",
        "meta/*",
        "router/*",
        "setup/*",
        "client/*",
        "server/*",
        "jsx/*",
        "parser/*",
      ],
    },
  },
});
