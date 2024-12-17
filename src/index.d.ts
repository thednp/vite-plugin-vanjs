import { type Plugin, type FilterPattern, createFilter } from 'vite';

/** Configuration options for vite-plugin-solid. */
export interface VitePluginVanJSOptions {
    /**
     * An array of paths to entry files. The default values are required in order to make
     * `van` and `vanX` available in both client and server environments.
     * 
     * @default ["src/entry-client", "src/entry-server"]
     */
    entries: string[];
    /**
     * Option to enable JSX transformation.
     * 
     * @default true
     */
    jsx?: boolean;
    jsxOptions?: {
        /**
         * A [picomatch](https://github.com/micromatch/picomatch) pattern, or array of patterns, which specifies the files
         * the plugin should operate on.
         */
        include?: FilterPattern;
        /**
         * A [picomatch](https://github.com/micromatch/picomatch) pattern, or array of patterns, which specifies the files
         * to be ignored by the plugin.
         */
        exclude?: FilterPattern;
        /**
         * Enable TypeScript transformation.
         *
         * @default true
         */
        typescript?: boolean;
    }

}

declare function VitePluginVanJSPlugin(options?: Partial<VitePluginVanJSOptions>): Plugin;
export default VitePluginVanJSPlugin;
