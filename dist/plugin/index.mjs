/*!
* vite-plugin-vanjs Vite Plugin v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { fileURLToPath } from "node:url";
import { dirname, join, posix, resolve, win32 } from "node:path";
import process from "node:process";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
//#region src/plugin/helpers.ts
/**
* Get the file most probable route path for a given potential route.
*/
const fileToRoute = (file, routesDir) => {
	const cleanPath = file.slice(routesDir.length + 1).replace(/\.(jsx|tsx|ts|js)$/, "").replace(/index$/, "").replace(/\(.*\)$/, "").replace(/\([^)]+\)\/?/g, "").replace(/\[\.\.\.[^\]]+\]/g, "*").replace(/\[([^\]]+)\]/g, ":$1");
	const slashPath = cleanPath.endsWith("/") ? cleanPath.slice(0, -1) : cleanPath;
	return slashPath === "*" ? slashPath : slashPath?.length > 0 ? `/${slashPath}` : "/";
};
/**
* Identify all files in a folder.
*/
const globFiles = async (dir, extensions) => {
	const files = [];
	async function scan(directory) {
		if (!existsSync(directory)) return;
		const entries = await readdir(directory, { withFileTypes: true });
		if (!entries.length) return;
		for (const entry of entries) {
			const fullPath = join(directory, entry.name);
			if (entry.isDirectory()) await scan(fullPath);
			else if (entry.isFile()) {
				if (extensions.some((ext) => entry.name.endsWith(ext))) files.push(fullPath);
			}
		}
	}
	await scan(dir);
	return files;
};
const normalizePathRegExp = new RegExp(`\\${win32.sep}`, "g");
function normalizePath(filename) {
	return filename.replace(normalizePathRegExp, posix.sep);
}
/**
* Scan routes directory and generate routes.
*/
const scanRoutes = async (config, pluginConfig) => {
	const { routesDir, extensions } = pluginConfig;
	const routesPath = join(config.root, routesDir);
	const files = await globFiles(routesPath, extensions);
	if (!files?.length) return [];
	return files.map((file) => ({
		path: normalizePath(file),
		routePath: fileToRoute(file, routesPath)
	})).reduce((acc, route) => {
		const existing = acc.find((r) => r.routePath === route.routePath);
		if (!existing || existing.path.includes("(") && !route.path.includes("(")) {
			if (existing) acc = acc.filter((r) => r !== existing);
			acc.push(route);
		}
		return acc;
	}, []);
};
/**
* Find all layout files for a given route.
*/
const findLayouts = (routePath, config, pluginConfig) => {
	const { routesDir, extensions } = pluginConfig;
	const layouts = [];
	let dir = dirname(routePath);
	const routesPath = join(config.root, routesDir);
	while (dir.startsWith(routesPath) && dir !== routesPath) {
		let layoutFile = null;
		const dirName = dir.split(/[/\\]/).pop();
		if (dirName) for (const ext of extensions) {
			const layoutPaths = [join(dirname(dir), `${dirName}${ext}`), join(dirname(dir), `(${dirName.replace(/^\((.*)\)$/, "$1")})${ext}`)];
			for (const path of layoutPaths) if (existsSync(path)) {
				layoutFile = path;
				break;
			}
		}
		if (layoutFile && layoutFile !== routePath) layouts.unshift({
			id: `Layout${layouts.length}`,
			path: layoutFile
		});
		dir = dirname(dir);
	}
	return layouts;
};
/**
* Process routes and identify their layouts
*/
const processLayoutRoutes = (routes, config, pluginConfig) => {
	if (!routes.length) return [];
	return routes.map((route) => {
		const layouts = findLayouts(route.path, config, pluginConfig);
		return {
			...route,
			layouts
		};
	});
};
/**
* Scan and process routes and return them
* @type {typeof import("./types").getRoutes}
*/
const getRoutes = async (config, pluginConfig) => {
	return processLayoutRoutes(await scanRoutes(config, pluginConfig), config, pluginConfig);
};
const generateRouteProloaders = (route) => {
	const moduleName = "PageModule";
	const layoutName = "Module";
	return `{
    preload: async (params) => {
      ${route.layouts.map((layout) => `if (${layout.id + layoutName}?.route?.preload) await ${layout.id + layoutName}?.route?.preload(params);`).join("\n      ")}
      if (${moduleName}?.route?.preload) await ${moduleName}?.route?.preload(params);
    },
    load: async (params) => {
      ${route.layouts.map((layout) => `if (${layout.id + layoutName}?.route?.load) await ${layout.id + layoutName}?.route?.load(params);`).join("\n      ")}
      if (${moduleName}?.route?.load) await ${moduleName}?.route?.load(params);
    }
  }`;
};
const generateComponentRoute = (route) => {
	if (route.layouts?.length > 0) {
		const layoutImports = route.layouts.map((layout) => `const ${layout.id}Module = await import('${layout.path}');\nconst ${layout.id}Page = ${layout.id}Module.Layout || ${layout.id}Module.Page || ${layout.id}Module.default;`).join("\n");
		const pageComponent = route.layouts.reduce((acc, layout) => `${layout.id}Page({ children: ${acc} })`, "Page()");
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
const generateRoute = (route) => {
	return `Route({
    path: "${route.routePath}",
    component: ${generateComponentRoute(route)},
  });`;
};
//#endregion
//#region src/plugin/index.ts
const __dirname = dirname(fileURLToPath(import.meta.url));
const toAbsolute = (p) => resolve(__dirname, p);
const extension = __dirname.includes("/vite-plugin-vanjs/src/") ? ".ts" : ".mjs";
const pluginDefaults = {
	routesDir: "src/routes",
	extensions: [
		".tsx",
		".jsx",
		".ts",
		".js"
	]
};
const moduleAliases = {
	"@vanjs/van": "../setup/van",
	"@vanjs/vanX": "../setup/vanX",
	"@vanjs/client": "../client/client",
	"@vanjs/server": "../server/server",
	"@vanjs/meta": "../meta/meta",
	"@vanjs/router": "../router/router",
	"@vanjs/jsx": "../jsx-runtime/jsx-runtime"
};
const ssrModuleAliases = {
	"@vanjs/van": "../setup/van-ssr",
	"@vanjs/vanX": "../setup/vanX-ssr"
};
const debugModuleAliases = { "@vanjs/van": "../setup/van-debug" };
const ssrAliases = {
	...moduleAliases,
	...ssrModuleAliases
};
const debugAliases = {
	...moduleAliases,
	...debugModuleAliases
};
const VitePluginVanJS = (options = {}) => {
	const pluginConfig = {
		...pluginDefaults,
		...options
	};
	const { routesDir } = pluginConfig;
	let config;
	let routeCache = null;
	let isOxc = true;
	const virtualModuleId = "virtual:@vanjs/routes";
	const resolvedVirtualModuleId = "\0" + virtualModuleId;
	const isProduction = process.env.NODE_ENV === "production";
	const isTest = process.env.NODE_ENV === "test";
	return {
		name: "vanjs",
		enforce: "pre",
		buildStart() {
			const viteVersion = this.meta?.viteVersion;
			isOxc = Number(viteVersion[0]) >= 8;
		},
		config() {
			const cfg = {
				optimizeDeps: {
					noDiscovery: true,
					include: [
						"vanjs-core",
						"vanjs-ext",
						"mini-van-plate"
					]
				},
				ssr: { noExternal: [
					"vanjs-*",
					"*-vanjs",
					"@vanjs/*"
				] }
			};
			if (isOxc) cfg.oxc = {
				include: /\.(jsx?|tsx?)$/,
				jsx: {
					runtime: "automatic",
					importSource: "vite-plugin-vanjs"
				}
			};
			else cfg.esbuild = {
				jsx: "automatic",
				jsxImportSource: "vite-plugin-vanjs"
			};
			return cfg;
		},
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer(server) {
			const pagesPath = join(config.root, routesDir);
			const changeHandler = (file) => {
				if (file.startsWith(pagesPath)) {
					const routesPath = isTest ? toAbsolute("../router/routes.ts") : "vite-plugin-vanjs/router-routes";
					const updateRoutes = async () => {
						const { routes } = await import(routesPath);
						routes.length = 0;
						routeCache = null;
					};
					updateRoutes().then(() => {
						const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
						if (module) server.moduleGraph.invalidateModule(module);
						server.ws.send({ type: "full-reload" });
					});
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
			if (source === virtualModuleId) return resolvedVirtualModuleId;
			const isSetupFile = typeof importer === "string" && importer.includes("vite-plugin-vanjs/dist/setup");
			const isImportedVanXFile = typeof importer === "string" && importer.includes("vite-plugin-vanjs/dist/setup/van-ext");
			const isResolvedVanXFile = source.includes("vite-plugin-vanjs/dist/setup/van-ext");
			const isResolvedVanFile = !isResolvedVanXFile && source.includes("vite-plugin-vanjs/dist/setup/van");
			const isJSXImport = source.includes("/vite-plugin-vanjs/dist/jsx") || typeof importer === "string" && importer.includes("/vite-plugin-vanjs/dist/jsx");
			const isDebugImport = !ssr && typeof importer === "string" && importer.includes("/src/van.debug.js") && source.includes("/van.js");
			let aliases = moduleAliases;
			if (isDebugImport) return toAbsolute("../setup/van" + extension);
			if (ssr) aliases = ssrAliases;
			else if (!isProduction && !isJSXImport) aliases = debugAliases;
			const matchedSource = isResolvedVanFile || source === "vanjs-core" && !isSetupFile ? "@vanjs/van" : isResolvedVanXFile || source === "vanjs-ext" && !isImportedVanXFile ? "@vanjs/vanX" : source in aliases ? source : null;
			const resolvedPath = matchedSource ? aliases[matchedSource] : null;
			if (resolvedPath) return toAbsolute(resolvedPath + extension);
			return null;
		},
		async load(id, ops) {
			if (id === resolvedVirtualModuleId) {
				const currentRoutes = routeCache || await getRoutes(config, pluginConfig);
				if (!currentRoutes || !currentRoutes.length) return {
					code: "",
					map: null
				};
				const routesScript = `
import { Route } from "${isTest ? toAbsolute("../router/route" + extension) : "vite-plugin-vanjs/router-route"}";
import { routes } from "${isTest ? toAbsolute("../router/routes" + extension) : "vite-plugin-vanjs/router-routes"}";
import { lazy } from "${isTest ? toAbsolute("../router/lazy" + extension) : "vite-plugin-vanjs/router-lazy"}";


routes.length = 0;


${currentRoutes.map(generateRoute).join("\n")}
${ops?.ssr && currentRoutes.length ? `console.log(\`🍦 @vanjs/router registered ${currentRoutes.length} routes.\`)` : ""}
`;
				const vite = await import("vite");
				const transformer = isOxc ? "transformWithOxc" : "transformWithEsbuild";
				const langProp = isOxc ? "lang" : "loader";
				const result = await vite[transformer](routesScript, id, {
					[langProp]: "js",
					sourcemap: true
				});
				return {
					code: result.code,
					map: result.map ? typeof result.map === "string" ? JSON.parse(result.map) : result.map : null
				};
			}
			return null;
		}
	};
};
//#endregion
export { VitePluginVanJS as default };

//# sourceMappingURL=index.mjs.map