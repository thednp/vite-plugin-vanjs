/** @typedef {import("vite").ResolvedConfig} ResolvedConfig */
/** @typedef {import("./types").PageFile} PageFile */
/** @typedef {import("./types").RouteFile} RouteFile */

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { transformWithEsbuild } from "vite";
import { routes } from "../router/routes.mjs";
import { generateRoute, getRoutes } from "./helpers.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/** @param {string} p */
const toAbsolute = (p) => resolve(__dirname, p);

const pluginDefaults = {
  routesDir: "src/routes",
  extensions: [".tsx", ".jsx", ".ts", ".js"],
};

export default function VitePluginVanJS(options = {}) {
  const pluginConfig = { ...pluginDefaults, ...options };
  const { routesDir } = pluginConfig;

  /** @type {ResolvedConfig} */
  let config;
  /** @type {RouteFile[] | null} */
  let routeCache = null;

  const virtualModuleId = "virtual:@vanjs/routes";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "vanjs",
    enforce: "pre",
    config() {
      return {
        optimizeDeps: {
          noDiscovery: true,
          include: [
            "vanjs-core",
            "vanjs-ext",
            "mini-van-plate",
          ],
        },
        ssr: {
          noExternal: ["vanjs-*", "*-vanjs", "@vanjs/*"],
        },
        resolve: {
          alias: {
            "@vanjs/setup": toAbsolute("../setup/index"),
            "@vanjs/van": toAbsolute("../setup/van"),
            "@vanjs/vanX": toAbsolute("../setup/vanX"),
            "@vanjs/client": toAbsolute("../client"),
            "@vanjs/server": toAbsolute("../server"),
            "@vanjs/meta": toAbsolute("../meta"),
            "@vanjs/router": toAbsolute("../router"),
            "@vanjs/jsx": toAbsolute("../jsx"),
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
      /** @param {string} file */
      const changeHandler = (file) => {
        // istanbul ignore else
        if (file.startsWith(pagesPath)) {
          routes.length = 0;
          routeCache = null;
          const module = server.moduleGraph.getModuleById(
            resolvedVirtualModuleId,
          );
          // istanbul ignore else
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
          server.ws.send({ type: "full-reload" });
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
    /** @type {(source: string, importer: string | undefined, ops: { ssr: boolean }) => string | null} */
    resolveId(source, importer, ops) {
      const isVanXFile = importer &&
        /vanjs-ext[\/\\]src[\/\\]van-x/.test(importer);
      const isSetupFile = importer &&
        /vite-plugin-vanjs[\/\\]setup/.test(importer);
      const isProduction = process.env.NODE_ENV === "production";
      const isJSXImport = source.includes("/vite-plugin-vanjs/jsx/jsx") ||
        importer?.includes("/vite-plugin-vanjs/jsx/jsx.mjs");

      const resolvedVan = toAbsolute(
        ops.ssr ? "../setup/van-ssr.mjs" : (isJSXImport || isProduction ||
            config.mode === "test")
          ? "../setup/van.mjs"
          : "../setup/van-debug.mjs",
      );
      const resolvedVanX = toAbsolute(
        ops.ssr ? "../setup/vanX-ssr.mjs" : "../setup/vanX.mjs",
      );
      const setupResolved = toAbsolute(
        ops.ssr
          ? "../setup/index-ssr.mjs"
          : (isProduction || config.mode === "test")
          ? "../setup/index.mjs"
          : "../setup/index-debug.mjs",
      );

      // istanbul ignore else
      if (!isSetupFile && !isVanXFile) {
        if (source === "@vanjs/setup") {
          return setupResolved;
        }
        if (importer?.endsWith("debug.js") && source.endsWith("/van.js")) {
          return toAbsolute("../setup/van.mjs");
        }
        if (source === "vanjs-core" || source === "@vanjs/van") {
          return resolvedVan;
        }
        if (source === "vanjs-ext" || source === "@vanjs/vanX") {
          return resolvedVanX;
        }
      }
      // istanbul ignore else
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return null;
    },
    /** @type {(id: string, ops: { ssr: boolean }) => Promise<({ code: string, map: null } | null)>} */
    async load(id, ops) {
      // istanbul ignore else
      if (id === resolvedVirtualModuleId) {
        const currentRoutes = routeCache ||
          await getRoutes(config, pluginConfig);
        if (!currentRoutes || !currentRoutes.length) {
          // don't crash the server if no routes are found
          // devs might not use file system router
          return { code: "", map: null };
        }

        const routesScript = `
import { Route, routes } from "@vanjs/router/routes.mjs";
import { lazy } from "@vanjs/router/lazy.mjs";

// Reset current routes
routes.length = 0;

// Register routes
${currentRoutes.map(generateRoute).join("\n")}
${
          ops.ssr && currentRoutes.length
            ? `console.log(\`🍦 @vanjs/router registered ${currentRoutes.length} routes.\`)`
            : /* istanbul ignore next - satisfied */ ""
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
