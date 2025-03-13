import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

export default function VitePluginVanJS() {
  return {
    name: "vanjs",
    enforce: "pre",
    config() {
      return {
        ssr: {
          noExternal: ["vanjs-*", "*-vanjs", "@vanjs/*"],
        },
        resolve: {
          alias: {
            "@vanjs/setup": resolve(
              __dirname,
              isProduction
                ? /* istanbul ignore next */ "../setup/index"
                : "../setup/index-debug",
            ),
            "@vanjs/van": resolve(
              __dirname,
              isProduction
                ? /* istanbul ignore next */ "../setup/van"
                : "../setup/van-debug",
            ),
            "@vanjs/vanX": resolve(__dirname, "../setup/vanX"),
            "@vanjs/client": resolve(__dirname, "../client"),
            "@vanjs/server": resolve(__dirname, "../server"),
            "@vanjs/meta": resolve(__dirname, "../meta"),
            "@vanjs/router": resolve(__dirname, "../router"),
            "@vanjs/jsx": resolve(__dirname, "../jsx"),
            "@vanjs/parser": resolve(__dirname, "../parser"),
          },
        },
        esbuild: {
          jsx: "automatic",
          jsxImportSource: "@vanjs/jsx",
        },
      };
    },
    transform(code, id) {
      let newCode = String(code);

      const vanCoreReg = /import\s*.*\s*from\s*['"]vanjs-core['"]/g;
      const vanExtReg = /import\s*.*\s*from\s*['"]vanjs-ext['"]/g;
      const isSetupFile = /vite-plugin-vanjs[\\/]setup/.test(id);
      const isVanXFile = /vanjs-ext[\\/]src[\\/]van-x/.test(id);

      /* istanbul ignore else */
      if (!isSetupFile && !isVanXFile) {
        /* istanbul ignore next - the plugin works, istanbul isn't instrumenting this part properly */
        if (vanCoreReg.test(newCode)) {
          newCode = newCode.replace(
            vanCoreReg,
            (match) => match.replace("vanjs-core", "@vanjs/van"),
          );
        }
        /* istanbul ignore next - the plugin works, istanbul isn't instrumenting this part properly */
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
