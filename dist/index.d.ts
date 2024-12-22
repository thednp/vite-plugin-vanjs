declare const VitePluginVanJS: (config?: VitePluginVanJSPluginOptions) => any;
export default VitePluginVanJS;

declare type VitePluginVanJSPluginOptions = {
    entries?: string[];
};

export { }


declare namespace vansSetup {
    const isServer: boolean;
    const van: import("mini-van-plate/van-plate").Van | import("vanjs-core").Van;
    const vanX: import("mini-van-plate/shared").VanXObj | typeof import("vanjs-ext");
}
