import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function VitePluginVanJS() {
  return {
    name: "vanjs",
    enforce: "pre",
    config() {
      return {
        resolve: {
          alias: {
            "@vanjs/jsx": resolve(__dirname, "../jsx"),
            "@vanjs/setup": resolve(__dirname, "../setup"),
            "@vanjs/van": resolve(__dirname, "../setup/van"),
            "@vanjs/vanX": resolve(__dirname, "../setup/vanX"),
          },
        },
        optimizeDeps: {
          include: ["vanjs-core", "mini-van-plate", "vanjs-ext"],
        },
        esbuild: {
          jsx: "automatic",
          jsxFactory: "jsx",
          jsxFragment: "Fragment",
        },
      };
    },
  };
}
