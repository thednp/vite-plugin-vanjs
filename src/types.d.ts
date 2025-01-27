export * from "../jsx/types";
export * from "../setup/types";
export * from "../router/types";
export * from "../meta/types";
export * from "../server/types";
export * from "../client/types";

declare const VitePluginVanJS: () => {
  name: "string";
  enforce: "pre" | "post" | undefined;
  apply: "build";
  config(): {
    resolve: {
      alias: Record<string, string>;
    };
    esBuild: {
      jsx: "string";
      jsxImportSource: "string";
    };
  };
  transform(code: string, id?: string): {
    code: string;
    map: null;
  };
};
export default VitePluginVanJS;

export {};
