import { defineConfig, type UserConfig } from "tsdown";
import strip from "vite-plugin-strip-comments";

const pkg = await import("./package.json", { with: { type: "json" } }).then(
  (m) => m.default,
);

const year = new Date().getFullYear();
const banner = `/*!
* vite-plugin-vanjs $package v${pkg.version} (${pkg.homepage})
* Copyright 2025-${year} © ${pkg.author}
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/`;

const defaultConfig: UserConfig = {
  // noExternal: [],
  deps: {
    skipNodeModulesBundle: true,
    neverBundle: [
      // "@thednp/parser",
      "csstype",
      "vite",
      "rollup",
      "rolldown",
      "vanjs-core",
      "van-ext",
      "mini-van-plate",
      "vite-plugin-vanjs/van",
      "vite-plugin-vanjs/van-ssr",
      "vite-plugin-vanjs/van-debug",
      "vite-plugin-vanjs/van-ext",
      "vite-plugin-vanjs/van-ext-ssr",
      "vite-plugin-vanjs/client",
      "vite-plugin-vanjs/router",
      "vite-plugin-vanjs/router-routes",
      "vite-plugin-vanjs/router-route",
      "vite-plugin-vanjs/router-lazy",
      "vite-plugin-vanjs/server",
      "vite-plugin-vanjs/meta",
      "virtual:@vanjs/routes",
      "@vanjs/van",
      "@vanjs/vanX",
      "@vanjs/meta",
      "@vanjs/router",
      "@vanjs/client",
    ],
  },
  // clean: true,
  target: "esnext",
  plugins: [strip({ type: "keep-jsdoc" })],
  exports: true,
  format: ["esm"],
  dts: {
    sourcemap: true,
    sideEffects: false,
  },
  // sourcemap: true,
  // globalName: "vanjs-core",
};

export default defineConfig([
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Vite Plugin"),
    entry: {
      index: "src/plugin/index.ts",
    },
    outDir: "dist/plugin",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Client"),
    entry: {
      client: "src/client/index.ts",
    },
    outDir: "dist/client",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Core SSR"),
    entry: {
      server: "src/server/index.ts",
    },
    outDir: "dist/server",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Van"),
    entry: {
      van: "src/setup/van.ts",
    },
    outDir: "dist/setup",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Van SSR"),
    entry: {
      "van-ssr": "src/setup/van-ssr.ts",
    },
    outDir: "dist/setup",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Van Debug"),
    entry: {
      "van-debug": "src/setup/van-debug.ts",
    },
    outDir: "dist/setup",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "VanX"),
    entry: {
      "van-ext": "src/setup/vanX.ts",
    },
    outDir: "dist/setup",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "VanX SSR"),
    entry: {
      "van-ext-ssr": "src/setup/vanX-ssr.ts",
    },
    outDir: "dist/setup",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Meta"),
    entry: {
      meta: "src/meta/index.ts",
    },
    outDir: "dist/meta",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Router"),
    entry: {
      router: "src/router/index.ts",
    },
    outDir: "dist/router",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Route Module"),
    entry: {
      "router-route": "src/router/route.ts",
    },
    outDir: "dist/router",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Routes Module"),
    entry: {
      "router-routes": "src/router/routes.ts",
    },
    outDir: "dist/router",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "Lazy Module"),
    entry: {
      "router-lazy": "src/router/lazy.ts",
    },
    outDir: "dist/router",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "JSX Runtime"),
    entry: {
      "jsx-runtime": "src/jsx/jsx-runtime.ts",
    },
    outDir: "dist/jsx-runtime",
  },
  {
    ...defaultConfig,
    banner: banner.replace("$package", "JSX Dev Runtime"),
    entry: {
      "jsx-dev-runtime": "src/jsx/jsx-dev-runtime.ts",
    },
    outDir: "dist/jsx-dev-runtime",
  },
]);
