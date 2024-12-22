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
