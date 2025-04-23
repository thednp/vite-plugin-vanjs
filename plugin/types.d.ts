export * from "../jsx/types";
export * from "../setup/types";
export * from "../router/types";
export * from "../meta/types";
export * from "../server/types";
export * from "../client/types";
export * from "../parser/types";
import { ResolvedConfig, ViteDevServer } from "vite";

export type VitePluginVanJSOptions = {
  routesDir: string;
  extensions: string[];
};

declare const VitePluginVanJS: (options?: Partial<VitePluginVanJSOptions>) => {
  name: "string";
  enforce: "pre" | "post" | undefined;
  config(): {
    resolve: {
      alias: Record<string, string>;
    };
    esBuild: {
      jsx: "string";
      jsxImportSource: "string";
    };
  };
  configResolved(resolvedConfig: ResolvedConfig): void;
  configureServer(server: ViteDevServer): void;
  resolveId(
    source: string,
    importer?: string,
    options?: {
      attributes: Record<string, string>;
      ssr?: boolean | undefined;
      isEntry: boolean;
    },
  ): string;
  load(
    id: string,
    ops?: { ssr?: boolean | undefined },
  ):
    | null
    | { code: string; map: string | null }
    | Promise<null | { code: string; map: string | null }>;
};
export default VitePluginVanJS;

export {};
