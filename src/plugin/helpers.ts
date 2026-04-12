import type { PluginConfig, RouteFile } from "./types.d.ts";
import type { FileRouteConfig } from "../router/types.d.ts";
import { dirname, join, posix, win32 } from "node:path";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import type { ResolvedConfig } from "vite";

/**
 * Get the file most probable route path for a given potential route.
 */
export const fileToRoute = (file: string, routesDir: string) => {
  const cleanPath = file
    .slice(routesDir.length + 1) // also remove initial slash
    .replace(/\.(jsx|tsx|ts|js)$/, "")
    .replace(/index$/, "")
    .replace(/\(.*\)$/, "") // Remove (file_name) from path
    .replace(/\([^)]+\)\/?/g, "") // Remove (folder_name) from path
    .replace(/\[\.\.\.[^\]]+\]/g, "*")
    .replace(/\[([^\]]+)\]/g, ":$1");
  const slashPath = cleanPath.endsWith("/")
    ? cleanPath.slice(0, -1)
    : cleanPath;
  const path = slashPath === "*"
    ? slashPath
    : slashPath?.length > 0
    ? `/${slashPath}`
    : "/";

  return path;
};

/**
 * Identify all files in a folder.
 */
export const globFiles = async (dir: string, extensions: string[]) => {
  const files: string[] = [];

  async function scan(directory: string) {
    if (!existsSync(directory)) {
      // console.log('🍦 @vanjs/router: the "routes" folder does not exist.');
      return;
    }
    const entries = await readdir(directory, { withFileTypes: true });
    if (!entries.length) {
      // console.warn('🍦 @vanjs/router: the "routes" folder is empty.');
      return;
    }

    for (const entry of entries) {
      const fullPath = join(directory, entry.name);

      // istanbul ignore else
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile()) {
        // Check if file has allowed extension
        // istanbul ignore else
        if (extensions.some((ext) => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return files;
};

const normalizePathRegExp = new RegExp(`\\${win32.sep}`, "g");
function normalizePath(filename: string) {
  return filename.replace(normalizePathRegExp, posix.sep);
}

/**
 * Scan routes directory and generate routes.
 */
export const scanRoutes = async (
  config: ResolvedConfig,
  pluginConfig: PluginConfig,
) => {
  const { routesDir, extensions } = pluginConfig;
  const routesPath = join(config.root, routesDir);
  const files = await globFiles(routesPath, extensions);

  if (!files?.length) {
    return [];
  }

  // Filter out duplicate routes and layout files that are already used
  const routes = files.map((file) => ({
    path: normalizePath(file),
    routePath: fileToRoute(file, routesPath),
  }));

  // Remove duplicate routes (prefer non-layout files)
  const uniqueRoutes: typeof routes = routes.reduce(
    (acc: typeof routes, route) => {
      const existing = acc.find((r) => r.routePath === route.routePath);
      if (
        !existing || (existing.path.includes("(") && !route.path.includes("("))
      ) {
        // Remove the existing route if this is a better match
        // istanbul ignore if - should not be possible
        if (existing) {
          acc = acc.filter((r) => r !== existing);
        }
        acc.push(route);
      }
      return acc;
    },
    [],
  );

  return uniqueRoutes;
};

/**
 * Find all layout files for a given route.
 */
export const findLayouts = (
  routePath: string,
  config: ResolvedConfig,
  pluginConfig: PluginConfig,
) => {
  const { routesDir, extensions } = pluginConfig;
  const layouts = [];
  let dir = dirname(routePath);
  const routesPath = join(config.root, routesDir);

  // Walk up the directory tree looking for layout files
  while (dir.startsWith(routesPath) && dir !== routesPath) { // Stop at routes dir
    let layoutFile = null;
    const dirName = dir.split(/[/\\]/).pop();

    // istanbul ignore else
    if (dirName) {
      // Look for a layout file in the current directory
      for (const ext of extensions) {
        const layoutPaths = [
          join(dirname(dir), `${dirName}${ext}`),
          join(dirname(dir), `(${dirName.replace(/^\((.*)\)$/, "$1")})${ext}`),
        ];

        for (const path of layoutPaths) {
          if (existsSync(path)) {
            layoutFile = path;
            break;
          }
        }
      }
    }

    // istanbul ignore else
    if (layoutFile && layoutFile !== routePath) {
      layouts.unshift({
        id: `Layout${layouts.length}`,
        path: layoutFile,
      });
    }

    dir = dirname(dir);
  }

  return layouts;
};

/**
 * Process routes and identify their layouts
 */
export const processLayoutRoutes = (
  routes: FileRouteConfig[],
  config: ResolvedConfig,
  pluginConfig: PluginConfig,
) => {
  if (!routes.length) return [];

  return routes.map((route) => {
    const layouts = findLayouts(route.path, config, pluginConfig);
    return {
      ...route,
      layouts,
    };
  });
};

/**
 * Scan and process routes and return them
 * @type {typeof import("./types").getRoutes}
 */
// export const scanRoutes = async (config, pluginConfig) => {}
export const getRoutes = async (
  config: ResolvedConfig,
  pluginConfig: PluginConfig,
) => {
  const routes = await scanRoutes(config, pluginConfig);
  return processLayoutRoutes(routes, config, pluginConfig);
};

export const generateRouteProloaders = (route: RouteFile) => {
  const moduleName = "PageModule";
  const layoutName = "Module";

  return `{
    preload: async (params) => {
      ${
    route.layouts.map((layout) =>
      `if (${layout.id + layoutName}?.route?.preload) await ${
        layout.id + layoutName
      }?.route?.preload(params);`
    ).join("\n      ")
  }
      if (${moduleName}?.route?.preload) await ${moduleName}?.route?.preload(params);
    },
    load: async (params) => {
      ${
    route.layouts.map((layout) =>
      `if (${layout.id + layoutName}?.route?.load) await ${
        layout.id + layoutName
      }?.route?.load(params);`
    ).join("\n      ")
  }
      if (${moduleName}?.route?.load) await ${moduleName}?.route?.load(params);
    }
  }`;
};

export const generateComponentRoute = (route: RouteFile) => {
  if (route.layouts?.length > 0) {
    // Only generate imports for unique layouts
    const layoutImports = route.layouts.map(
      (layout) =>
        `const ${layout.id}Module = await import('${layout.path}');\n` +
        `const ${layout.id}Page = ${layout.id}Module.Layout || ${layout.id}Module.Page || ${layout.id}Module.default;`,
    ).join("\n");

    // Use both shared and unique layouts for the component chain
    const pageComponent = route.layouts.reduce(
      (acc, layout) => `${layout.id}Page({ children: ${acc} })`,
      "Page()",
    );

    return `lazy(() => {
      const importFn = async () => {
        ${layoutImports}
        const PageModule = await import('${route.path}');
        const Page = PageModule?.Page || PageModule?.default;
  
        return Promise.resolve({
          route: ${generateRouteProloaders(route)},
          Page: () => ${pageComponent},
        });
      };
      return importFn();
    })`;
  }

  return `lazy(() => import('${route.path}'))`;
};

export const generateRoute = (route: RouteFile) => {
  return `Route({
    path: "${route.routePath}",
    component: ${generateComponentRoute(route)},
  });`;
};
