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
            "@vanjs/setup": resolve(__dirname, "../setup"),
            "@vanjs/van": resolve(__dirname, "../setup/van"),
            "@vanjs/vanX": resolve(__dirname, "../setup/vanX"),
            "@vanjs/dom": resolve(__dirname, "../dom"),
            "@vanjs/server": resolve(__dirname, "../server"),
            "@vanjs/meta": resolve(__dirname, "../meta"),
            "@vanjs/router": resolve(__dirname, "../router"),
            "@vanjs/jsx": resolve(__dirname, "../jsx"),
          },
        },
        esbuild: {
          jsx: "automatic",
          jsxFactory: "jsx",
          jsxFragment: "Fragment",
        },
      };
    },
    transform(code, id) {
      let newCode = code;

      const vanCoreReg = /import\s*.*\s*from\s*['"]vanjs-core['"]/g;
      const vanExtReg = /import\s*.*\s*from\s*['"]vanjs-ext['"]/g;
      const isSetupFile = /vite-plugin-vanjs[\\/]setup/.test(id);
      const isVanXFile = /vanjs-ext[\\/]src[\\/]van-x/.test(id);

      if (!isSetupFile && !isVanXFile) {
        if (vanCoreReg.test(newCode)) {
          newCode = newCode.replace(
            vanCoreReg,
            (match) => match.replace("vanjs-core", "@vanjs/van"),
          );
        }
        if (vanExtReg.test(newCode)) {
          newCode = newCode.replace(
            vanExtReg,
            (match) => match.replace("vanjs-ext", "@vanjs/vanX"),
          );
        }
      }

      return {
        code: newCode,
        map: null,
      };
    },
  };
}
