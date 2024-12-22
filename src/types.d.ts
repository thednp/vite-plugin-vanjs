export type VitePluginVanJSPluginOptions = {
    entries?: string[];
};

export type VitePluginVanJSPlugin = Plugin<VitePluginVanJSPluginOptions> & {
    name: string;
    enforce: "pre";
    transform: (
        code: string,
        id?: string,
    ) => {
        code: string;
        map: string | null;
    };
};

// import { default as Setup } from "vite-plugin-vanjs/setup";
// export * from "vite-plugin-vanjs/setup";
// import JSX from "vite-plugin-vanjs/jsx";

// export type VansSetup = Setup;
// export type VansJSX = typeof JSX;
// export * from "../setup";
// export * from "../jsx";
// export * from "@vanjs/setup";
// export * from "@vanjs/jsx";
