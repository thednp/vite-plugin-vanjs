declare const VitePluginVanJS: (config?: VitePluginVanJSPluginOptions) => any;
export default VitePluginVanJS;

declare type VitePluginVanJSPluginOptions = {
    entries?: string[];
};

export { }

declare namespace _default {
    const isServer: boolean;
    const van: import("vanjs-core").Van | import("mini-van-plate/van-plate").Van;
    const vanX: import("mini-van-plate/shared").VanXObj | typeof import("vanjs-ext");
}
