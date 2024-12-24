import type { Plugin } from "vite";
import path from "node:path";

export default function VitePluginVanJS(): Plugin {
  return {
    name: "vanjs",
    enforce: "pre",
    config() {
      return {
        resolve: {
          alias: {
            "@vanjs/jsx": path.resolve(__dirname, "../jsx"),
            "@vanjs/setup": path.resolve(__dirname, "../setup"),
            "@vanjs/van": path.resolve(__dirname, "../setup/van"),
            "@vanjs/vanX": path.resolve(__dirname, "../setup/vanX"),
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
