// plugin/types.ts
export * from "../jsx/types";
export * from "../setup/types";
export * from "../router/types";
export * from "../meta/types";
export * from "../server/types";
export * from "../client/types";
export * from "../parser/types";
import type { PluginOption } from "vite";

export type VanJSPluginOptions = {
  routesDir: string;
  extensions: string[];
};

export declare const VitePluginVanJS: (
  config?: VitePluginVanJS,
) => PluginOption<VanJSPluginOptions>;

export default VitePluginVanJS;
