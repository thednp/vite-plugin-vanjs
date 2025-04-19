import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { transformWithEsbuild } from "vite";
import { routes } from "../router/routes.mjs";
import { generateRoute, getRoutes } from "./helpers.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

/** @typedef {import("vite").ResolvedConfig} ResolvedConfig */

const pluginDefaults = {
  routesDir: "src/routes",
  extensions: [".tsx", ".jsx", ".ts", ".js"],
};

export default function VitePluginVanJS(options = {}) {
  const pluginConfig = { ...pluginDefaults, ...options };
  const { routesDir } = pluginConfig;

  /** @type {ResolvedConfig} */
  let config;
  /** @type {PageFile[] | null} */
  let routeCache = null;

  const virtualModuleId = "virtual:@vanjs/routes";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

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
            "@vanjs/setup": resolve(__dirname, "../setup/index"),
            "@vanjs/van": resolve(__dirname, "../setup/van"),
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
    /** @param {import("vite").ResolvedConfig} resolvedConfig */
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    /** @param {import("vite").ViteDevServer} server */
    configureServer(server) {
      // Watch routes directory
      const pagesPath = join(config.root, routesDir);
      const changeHandler = (file) => {
        if (file.startsWith(pagesPath)) {
          routes.length = 0;
          routeCache = null;
          const module = server.moduleGraph.getModuleById(
            resolvedVirtualModuleId,
          );
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          server.hot.send({ type: "full-reload" });
        }
      };
      server.watcher.add(pagesPath);

      // Handle file changes in pages directory
      // 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'
      server.watcher.on("add", changeHandler);
      server.watcher.on("addDir", changeHandler);
      server.watcher.on("unlink", changeHandler);
      server.watcher.on("unlinkDir", changeHandler);
      server.watcher.on("change", changeHandler);
    },
    resolveId(source, importer, ops) {
      const isVanXFile = /vanjs-ext[\/\\]src[\/\\]van-x/.test(importer);
      const isSetupFile = /vite-plugin-vanjs[\/\\]setup/.test(importer);

      if (!isSetupFile && !isVanXFile) {
        if (source === "@vanjs/setup") {
          return resolve(
            __dirname,
            ops.ssr
              ? "../setup/index-ssr.mjs"
              : isProduction
              ? "../setup/index.mjs"
              : "../setup/index-debug.mjs",
          );
        }
        if (importer?.endsWith("debug.js") && source.endsWith("/van.js")) {
          return resolve(__dirname, "../setup/van.mjs");
        }
        if (source === "vanjs-core" || source === "@vanjs/van") {
          return resolve(
            __dirname,
            ops.ssr
              ? "../setup/van-ssr.mjs"
              : (importer.endsWith("jsx/jsx.mjs") || isProduction)
              ? "../setup/van.mjs"
              : "../setup/van-debug.mjs",
          );
        }
        if ((source === "vanjs-ext" || source === "@vanjs/vanX")) {
          return resolve(
            __dirname,
            ops.ssr ? "../setup/vanX-ssr.mjs" : "../setup/vanX.mjs",
          );
        }
      }
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id, ops) {
      if (id === resolvedVirtualModuleId) {
        const currentRoutes = routeCache ||
          await getRoutes(config, pluginConfig);
        if (!currentRoutes || !currentRoutes.length) {
          // don't crash the server if no routes are found
          // devs might not use file system router
          return "";
        }

        const routesScript = `
import { Route, routes } from "@vanjs/router/routes.mjs";
import { lazy } from "@vanjs/router/lazy.mjs";

// Reset current routes
routes.length = 0;

// Register routes
${currentRoutes.map(generateRoute).join("\n")}
${
          ops.ssr
            ? `console.log(\`🍦 @vanjs/router registered ${currentRoutes.length} routes.\`)`
            : ""
        }
`;

        const result = await transformWithEsbuild(
          routesScript,
          id,
          { loader: "js" },
        );

        return {
          code: result.code,
          map: null,
        };
      }
      return null;
    },
  };
}
