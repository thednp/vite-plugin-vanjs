import { type VitePluginVanJSPlugin} from '.';

const vanjsPlugin: VitePluginVanJSPlugin = (config = {}) => {
  const entries = ['src/entry-client', 'src/entry-server', ...(config.entries || [])].filter(Boolean);

  return {
    name: 'vite-plugin-vanjs',
    enforce: 'pre',
    transform(code, id) {
      if (entries.some((entry) => id.includes(entry))) {
        // Inject code to make 'van' available in both client and server environments
        return `// vite-plugin-vanjs
import { env, registerEnv, dummyVanX } from "mini-van-plate/shared";
import vanPlate from "mini-van-plate/van-plate";
import vanCore from "vanjs-core";
import * as vanX from "vanjs-ext";

function vanSetup() {
  const isServer = () => typeof window === "undefined";
  const getVanJS = () => isServer() ? vanPlate : vanCore;
  const getVanX = () => isServer() ? dummyVanX : vanX;

  if (typeof env.van === "undefined") {
    registerEnv({ van: getVanJS() });
  }
  registerEnv({ vanX: getVanX() });
}

vanSetup();
${code}`;
      }
      return code;
    },
  };
}

export default vanjsPlugin;
