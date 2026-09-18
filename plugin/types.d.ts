// plugin/types.ts
import type { Plugin } from "vite";
export * from "../jsx/types.d.ts";
export * from "../setup/types.d.ts";
export * from "../router/types.d.ts";
export * from "../meta/types.d.ts";
export * from "../server/types.d.ts";
export * from "../client/types.d.ts";

export type VanJSPluginOptions = {
  routesDir?: string;
  extensions?: string[];
  excludeRoutes?: string[]; // excluded in all envs
  excludeRoutesProd?: string[]; // excluded in production only
};

/**
 * The plugin context members the plugin reads from `this`.
 */
export type VitePluginContext = {
  meta?: { viteVersion?: string };
};

export type VitePluginVan = (
  config?: VanJSPluginOptions,
) => Plugin;

declare const VitePluginVanJS: VitePluginVan;
export default VitePluginVanJS;
