import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
// import vanjs from "./src/plugin/index.ts";

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const toAbsolute = (p: string) => resolve(__dirname, p);


const testResolver = (): Plugin => {
  const moduleAliases: Record<string, string> = {
    // "virtual:@vanjs/routes": toAbsolute("./src/router/routes.ts"),
    "@vanjs/van": "./src/setup/van",
    "@vanjs/vanX": "./src/setup/vanX",
    "@vanjs/client": "./src/client/index",
    "@vanjs/server": "./src/server/index",
    "@vanjs/meta": "./src/meta/index",
    "@vanjs/router": "./src/router/index",
    "@vanjs/jsx": "./src/jsx/index",
    "vite-plugin-vanjs/router-routes": "./src/router/routes",
    "vite-plugin-vanjs/router-route": "./src/router/route",
    "vite-plugin-vanjs/router-lazy":  "./src/router/lazy",
    "vite-plugin-vanjs/van": "./src/setup/van",
    "vite-plugin-vanjs/van-ext": "./src/setup/vanX",
    "vite-plugin-vanjs/client": "./src/client/index",
    "vite-plugin-vanjs/server": "./src/server/index",
    "vite-plugin-vanjs/meta": "./src/meta/index",
    "vite-plugin-vanjs/router": "./src/router/index",
    "vite-plugin-vanjs/jsx-runtime": "./src/jsx/index",
    "vite-plugin-vanjs/jsx-dev-runtime": "./src/jsx/index",
  };
  
  const ssrModuleAliases: Record<string, string> = {
    "@vanjs/van": "./src/setup/van-ssr",
    "@vanjs/vanX": "./src/setup/vanX-ssr",
    "vite-plugin-vanjs/van-ssr": "./src/setup/van-ssr",
    "vite-plugin-vanjs/van-ext-ssr": "./src/setup/vanX-ssr",
  };
  
  // const debugModuleAliases: Record<string, string> = {
  //   "@vanjs/van": "./src/setup/van-debug",
  // };
  
  // Pre-compute resolved alias maps at module scope
  const ssrAliases: Record<string, string> = {
    ...moduleAliases,
    ...ssrModuleAliases,
  };
  // const debugAliases: Record<string, string> = {
  //   ...moduleAliases,
  //   ...debugModuleAliases,
  // };

  return {
    name: "resolve-vanjs",
    // apply: "build",
    enforce: "pre",
    async resolveId(this, source, importer, options) {
      if (source === "virtual:@vanjs/routes") {
        return toAbsolute("./src/router/routes.ts");
        // return await vanjs().load?.(source, options)
      }
      let aliases: Record<string, string>;
      const isServer = typeof window === 'undefined';
      const isDebugImport = !isServer && typeof importer === "string" &&
        importer.includes("/src/van.debug.js") &&
        source.includes("/van.js");

      if (isDebugImport) {
        return toAbsolute("./src/setup/van.ts");
      }

      if (/*options.ssr &&*/ isServer) {
        aliases = ssrAliases;
      } else {
        aliases = ssrAliases;
      }
      if (source in aliases) return toAbsolute(aliases[source] + ".ts");
    },
  }
}

export default defineConfig({
  plugins: [
    testResolver()
    // vanjs({ routesDir: "tests/routes" })
  ],
  // resolve: {
  //   alias: {
  //     "virtual:@vanjs/routes": toAbsolute("./src/router/routes.ts")
  //   }
  // },
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
      include: ["src"],
    },
  },
});
