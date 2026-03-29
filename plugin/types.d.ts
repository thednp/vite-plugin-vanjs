// plugin/types.ts
export * from "../jsx/types.d.ts";
export * from "../setup/types.d.ts";
export * from "../router/types.d.ts";
export * from "../meta/types.d.ts";
export * from "../server/types.d.ts";
export * from "../client/types.d.ts";
import type { Plugin } from "vite";

export type VanJSPluginOptions = {
  routesDir?: string;
  extensions?: string[];
};

export declare const VitePluginVanJS: (
  config?: VanJSPluginOptions,
) => Plugin<VanJSPluginOptions>;

export default VitePluginVanJS;
