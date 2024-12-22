import type { VitePluginVanJSPluginOptions, VitePluginVanJSPlugin } from './types';
// import './types.d.ts';

const VitePluginVanJS = (config: VitePluginVanJSPluginOptions = {}) => {
  const defaultEntries = ['src/entry-client', 'src/entry-server'];
  const entries = [...defaultEntries, ...(config.entries || [])];

  return {
    name: 'vanjs',
    enforce: 'pre',
    transform(code: string, id?: string) {
      if (!id || !entries.some((entry) => id.includes(entry))) {
        return { code, map: null };
      }

      // Inject code to make 'van' available in server environment
      const result = `// vite-loader
import v from "vite-plugin-vanjs/setup";
// import v from "@vanjs/setup";
import { registerEnv } from "mini-van-plate/shared";
registerEnv(v);
${code}`;
      return { code: result, map: null };
    }
  } satisfies VitePluginVanJSPlugin;
}

export default VitePluginVanJS;
