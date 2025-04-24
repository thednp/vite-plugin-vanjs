// plugin/types.ts
export * from "../jsx/types";
export * from "../setup/types";
export * from "../router/types";
export * from "../meta/types";
export * from "../server/types";
export * from "../client/types";
export * from "../parser/types";
import type { Plugin } from "vite";

export type VanJSPluginOptions = {
  routesDir: string;
  extensions: string[];
};

export type VanJSPlugin = (
  options?: Partial<VanJSPluginOptions>,
) => Plugin;

// This is what your plugin actually returns, so declare it as a Plugin type
declare const VitePluginVanJS: VanJSPlugin;

export default VitePluginVanJS;
