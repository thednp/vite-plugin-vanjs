/** @typedef {typeof import("./types").VitePluginVanJS} VitePluginVanJS */
/** @typedef {import("./types").VanJSPluginOptions} VanJSPluginOptions */
/** @typedef {import("vite").ResolvedConfig} ResolvedConfig */
/** @typedef {import("./types").PageFile} PageFile */
/** @typedef {import("./types").RouteFile} RouteFile */
/** @typedef {import("vite").BuildAppHook} BuildAppHook */
/** @typedef {import("vite").TransformResult} TransformResult */
/** @typedef {import("vite").Plugin} Plugin */
/** @typedef {ThisParameterType<BuildAppHook>} PluginContext */

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
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

// Define module mapping configuration
const moduleAliases = {
  // Core modules
  "@vanjs/van": "../setup/van",
  "@vanjs/vanX": "../setup/vanX",

  // Setup modules
  "@vanjs/setup": "../setup/index",

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
  "@vanjs/vanX": "../setup/vanX-ssr",
  "@vanjs/setup": "../setup/index-ssr",
};

// Debug specific module mappings (development only)
const debugModuleAliases = {
  "@vanjs/van": "../setup/van-debug",
  "@vanjs/setup": "../setup/index-debug",
};

/** @type {VitePluginVanJS} */
export default function VitePluginVanJS(options = {}) {
  const pluginConfig = { ...pluginDefaults, ...options };
  const { routesDir } = pluginConfig;

  /** @type {ResolvedConfig} */
  let config;
  /** @type {RouteFile[] | null} */
  let routeCache = null;
  let isOxc = true;

  const virtualModuleId = "virtual:@vanjs/routes";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "vanjs",
    enforce: "pre",
    buildStart() {
      const viteVersion = this.meta?.viteVersion;
      isOxc = Number(viteVersion[0]) >= 8;
    },
    // @ts-expect-error - this is temporary esbuild will be
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
        ...(
          isOxc
            ? {
              oxc: {
                include: /\.(jsx?|tsx?)$/,
                jsx: {
                  runtime: "preserve", // Options: 'automatic', 'classic', 'preserve'
                  importSource: "@vanjs/jsx", // Default import source
                },
              },
            }
            : {
              esbuild: {
                jsx: "automatic",
                jsxImportSource: "@vanjs/jsx",
              },
            }
        ),
      };
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
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
      const isImportedVanXFile = typeof importer === "string" &&
        importer.includes("vite-plugin-vanjs/setup/vanX");
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
      /* istanbul ignore next @preserve */
      const matchedSource =
        isResolvedVanFile || (source === "vanjs-core" && !isSetupFile)
          ? "@vanjs/van"
          : isResolvedVanXFile ||
              (source === "vanjs-ext" &&
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
import { Route } from "@vanjs/router/route.mjs";
import { routes } from "@vanjs/router/routes.mjs";
import { lazy } from "@vanjs/router/lazy.mjs";

// Reset current routes
routes.length = 0;

// Register routes
${currentRoutes.map(generateRoute).join("\n")}
${
          (ops && ops.ssr && currentRoutes.length) &&
          `console.log(\`🍦 @vanjs/router registered ${currentRoutes.length} routes.\`)`
        }
`;

        const vite = await import("vite");
        const transformer = isOxc ? "transformWithOxc" : "transformWithEsbuild";
        const langProp = isOxc ? "lang" : "loader";
        // const mapProp = isOxc ? "source_map" : "sourcemap";

        const result = await vite[transformer](routesScript, id, {
          [langProp]: "js",
          sourcemap: true,
        });

        return {
          code: result.code,
          map: result.map
            ? (
              typeof result.map === "string"
                ? JSON.parse(result.map)
                : /* istanbul ignore next @preserve */ result.map
            )
            : /* istanbul ignore next @preserve */ null,
        };
      }
      return null;
    },
  };
}
