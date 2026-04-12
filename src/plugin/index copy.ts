import type { RouteFile, VanJSPlugin } from "./types.d.ts";
import type { ResolvedConfig, UserConfig } from "vite";

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import process from "node:process";

import { routes } from "../router/routes.ts";
import { generateRoute, getRoutes } from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const toAbsolute = (p: string) => resolve(__dirname, p);

const pluginDefaults = {
  routesDir: "src/routes",
  extensions: [".tsx", ".jsx", ".ts", ".js"],
};

const moduleAliases: Record<string, string> = {
  "@vanjs/van": "../setup/van",
  "@vanjs/vanX": "../setup/vanX",
  "@vanjs/client": "../client/client",
  "@vanjs/server": "../server/server",
  "@vanjs/meta": "../meta/meta",
  "@vanjs/router": "../router/router",
  "@vanjs/jsx": "../jsx-runtime/runtime",
};

const ssrModuleAliases: Record<string, string> = {
  "@vanjs/van": "../setup/van-ssr",
  "@vanjs/vanX": "../setup/vanX-ssr",
};

const debugModuleAliases: Record<string, string> = {
  "@vanjs/van": "../setup/van-debug",
};

// Pre-compute resolved alias maps at module scope
const ssrAliases: Record<string, string> = {
  ...moduleAliases,
  ...ssrModuleAliases,
};
const debugAliases: Record<string, string> = {
  ...moduleAliases,
  ...debugModuleAliases,
};
// const baseAliases: Record<string, string> = { ...moduleAliases };

const VitePluginVanJS: VanJSPlugin = (options = {}) => {
  const pluginConfig = { ...pluginDefaults, ...options };
  const { routesDir } = pluginConfig;

  let config: ResolvedConfig;
  let routeCache: RouteFile[] | null = null;
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
    config() {
      const cfg: UserConfig = {
        optimizeDeps: {
          noDiscovery: true,
          include: ["vanjs-core", "vanjs-ext", "mini-van-plate"],
        },
        ssr: {
          noExternal: ['vanjs-*', '*-vanjs', '@vanjs\/\*'],
          // noExternal: [
          //   "vanjs-core",
          //   "vanjs-ext",
          //   "mini-van-plate",
          //   "@vanjs/van",
          //   "@vanjs/vanX",
          //   "@vanjs/router",
          //   "@vanjs/meta",
          //   "@vanjs/client",
          //   "@vanjs/server",
          // ],
        },
      };

      if (isOxc) {
        cfg.oxc = {
          include: /\.(jsx?|tsx?)$/,
          jsx: {
            runtime: "automatic",
            importSource: "vite-plugin-vanjs",
          },
        };
      } else {
        cfg.esbuild = {
          jsx: "automatic",
          jsxImportSource: "vite-plugin-vanjs",
        } as UserConfig["esbuild"];
      }

      return cfg;
    },
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      const pagesPath = join(config.root, routesDir);
      const changeHandler = (file: string) => {
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

      // Match ANY file in dist/setup/ or src/setup/ to prevent infinite loops
      const isImportedVanXFile = typeof importer === "string" &&
        (importer.includes("vite-plugin-vanjs/dist/setup/van-ext"));

      const isResolvedVanXFile =
        source.includes("vite-plugin-vanjs/dist/setup/van-ext");

      const isResolvedVanFile = !isResolvedVanXFile &&
        source.includes("vite-plugin-vanjs/dist/setup/van");

      const isJSXImport = source.includes("/vite-plugin-vanjs/dist/jsx") ||
        (typeof importer === "string" &&
          (importer.includes("/vite-plugin-vanjs/dist/jsx")));

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
        aliases = ssrAliases;
      } else if (!isProduction && !isTest && !isJSXImport) {
        aliases = debugAliases;
      }

      // During tests, only resolve @vanjs/* aliases - but also handle vanjs-core/vanjs-ext for SSR
      if (isTest) {
        if (source in aliases) {
          return toAbsolute(aliases[source] + ".mjs");
        }
        // In SSR mode during tests, also intercept vanjs-core/vanjs-ext
        if (ssr) {
          const matchedSource = source === "vanjs-core"
            ? "@vanjs/van"
            : source === "vanjs-ext"
            ? "@vanjs/vanX"
            : null;
          if (matchedSource && matchedSource in aliases) {
            return toAbsolute(aliases[matchedSource] + ".mjs");
          }
        }
        return null;
      }

      // Check if the source is a known module
      /* istanbul ignore next @preserve */
      const matchedSource =
        isResolvedVanFile || (source === "vanjs-core")
          ? "@vanjs/van"
          : isResolvedVanXFile ||
              (source === "vanjs-ext" &&
                !isImportedVanXFile)
          ? "@vanjs/vanX"
          : source in aliases
          ? source
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
import { Route } from "vite-plugin-vanjs/router-route";
import { routes } from "vite-plugin-vanjs/router-routes";
import { lazy } from "vite-plugin-vanjs/router-lazy";

// Reset current routes
routes.length = 0;

// Register routes
${currentRoutes.map(generateRoute).join("\n")}
${
          ops?.ssr && currentRoutes.length
            ? `console.log(\`🍦 @vanjs/router registered ${currentRoutes.length} routes.\`)`
            : ""
        }
`;

        const vite = await import("vite");
        const transformer = isOxc ? "transformWithOxc" : "transformWithEsbuild";
        const langProp = isOxc ? "lang" : "loader";

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
};

export { VitePluginVanJS as default };
