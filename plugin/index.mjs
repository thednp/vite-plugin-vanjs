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

// Aliases coming from plugin.config()
// const resolvedVan = toAbsolute("../setup/van");
// const resolvedVanX = toAbsolute("../setup/vanX");
// const resolvedSetup = toAbsolute("../setup/index");

// Define module mapping configuration
const moduleAliases = {
  // Core modules
  "@vanjs/van": "../setup/van",
  // [resolvedVan]: "../setup/van",
  "@vanjs/vanX": "../setup/vanX",
  // [resolvedVanX]: "../setup/vanX",

  // Setup modules
  "@vanjs/setup": "../setup/index",
  // [resolvedSetup]: "../setup/index",

  // Other modules
  "@vanjs/client": "../client",
  "@vanjs/server": "../server",
  "@vanjs/meta": "../meta",
  "@vanjs/router": "../router",
  "@vanjs/jsx": "../jsx",
};

// SSR specific module mappings
const ssrModuleAliases = {
  "@vanjs/van": "../setup/van-ssr",
  // [resolvedVan]: "../setup/van-ssr",
  "@vanjs/vanX": "../setup/vanX-ssr",
  // [resolvedVanX]: "../setup/vanX-ssr",
  "@vanjs/setup": "../setup/index-ssr",
  // [resolvedSetup]: "../setup/index-ssr",
};

// Debug specific module mappings (development only)
const debugModuleAliases = {
  "@vanjs/van": "../setup/van-debug",
  // [resolvedVan]: "../setup/van-debug",
  "@vanjs/setup": "../setup/index-debug",
  // [resolvedSetup]: "../setup/index-debug",
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
            "mini-van-plate/van-plate",
            "mini-van-plate/shared",
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
    resolveId(source, importer, { ssr }) {
      // Handle virtual module
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      // Get the appropriate module aliases based on environment
      const isProduction = process.env.NODE_ENV === "production";
      const isTest = process.env.NODE_ENV === "test";
      const isSetupFile = typeof importer === "string" &&
        importer.includes("vite-plugin-vanjs/setup");
      // const isVanXFile = typeof importer === "string" &&
      //   importer.includes("vanjs-ext/src/van-x");
      const isImportedVanXFile = typeof importer === "string" &&
        importer.includes("vite-plugin-vanjs/setup/vanX");
      // const isImportedVanFile = !isImportedVanXFile && typeof importer === "string" &&
      //   importer.includes("vite-plugin-vanjs/setup/van");
      // const isImportedSetupFile = typeof importer === "string" &&
      //   importer.includes("vite-plugin-vanjs/setup/index");
      const isResolvedVanXFile = source.includes(
        "vite-plugin-vanjs/setup/vanX",
      );
      const isResolvedVanFile = !isResolvedVanXFile &&
        source.includes("vite-plugin-vanjs/setup/van");
      const isResolvedSetupFile = source.includes(
        "vite-plugin-vanjs/setup/index",
      );
      const isJSXImport = source.includes("/vite-plugin-vanjs/jsx/jsx") ||
        (typeof importer === "string" &&
          importer.includes("/vite-plugin-vanjs/jsx/jsx.mjs"));
      const isDebugImport = !ssr && typeof importer === "string" &&
        importer.includes("/src/van.debug.js") &&
        source.includes("/van.js");
      let aliases = moduleAliases;

      // Handle special case for debug
      if (isDebugImport) {
        return toAbsolute("../setup/van.mjs");
      }

      // Select appropriate aliases based on environment
      if (ssr) {
        aliases = { ...aliases, ...ssrModuleAliases };
      } else if (!isProduction && !isTest && !isJSXImport) {
        aliases = { ...aliases, ...debugModuleAliases };
      }
      // Check if the source is a known module
      const matchedSource =
        isResolvedVanFile || (source === "vanjs-core" && !isSetupFile)
          ? "@vanjs/van"
          : isResolvedVanXFile ||
              (source === "vanjs-ext" && /* istanbul ignore next */
                !isImportedVanXFile)
          ? "@vanjs/vanX"
          : isResolvedSetupFile && (!ssr && isSetupFile || ssr && !isSetupFile)
          ? "@vanjs/setup"
          : null;
      const resolvedPath = matchedSource ? aliases[matchedSource] : null;

      if (resolvedPath) {
        return toAbsolute(resolvedPath + ".mjs");
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
