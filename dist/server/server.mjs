/*!
* vite-plugin-vanjs Core SSR v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { basename, dirname, join, posix, win32 } from "node:path";
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
//#region src/server/index.ts
/**
* A function that takes a multitude of source types and returns a string
* representing the HTML output.
* @param source the source
* @returns HTML string
*/
async function renderToString(inputSource) {
	const source = typeof inputSource === "function" ? inputSource() : inputSource;
	if (typeof source === "number") return String(source);
	if (typeof source === "string") return source.trim();
	if (typeof source === "boolean") return String(source);
	if (typeof source === "object" && source !== null && "render" in source) return source.render();
	if (source instanceof Promise) return renderToString(await source);
	if (Array.isArray(source)) {
		const elements = [];
		for (const el of source) elements.push(await renderToString(el));
		return elements.join("");
	}
	console.warn("Render error! Source not recognized: " + source);
	return "";
}
function renderPreloadLink(file) {
	if (file.endsWith(".js")) return `<link rel="preload" href="${file}" as="script" crossorigin>`;
	else if (file.endsWith(".css")) return `<link rel="preload" href="${file}" as="style" crossorigin>`;
	else if (file.endsWith(".woff")) return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
	else if (file.endsWith(".woff2")) return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
	else if (file.endsWith(".gif")) return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
	else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
	else if (file.endsWith(".png")) return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
	else if (file.endsWith(".webp")) return ` <link rel="preload" href="${file}" as="image" type="image/webp">`;
	else {
		console.warn("Render error! File format not recognized: " + file);
		return "";
	}
}
/**
* A function that takes a list of files and a manifest and returns a string
* representing the HTML markup for preload links.
* @param files the list of files
* @param manifest the vite manifest
* @returns HTML string
*/
function renderPreloadLinks(modules, manifest) {
	let links = "";
	const seen = /* @__PURE__ */ new Set();
	const ignoredAssets = /* @__PURE__ */ new Set();
	Object.entries(manifest).forEach(([id, files]) => {
		if ([
			"src/pages",
			"src/routes",
			"vite-plugin-vanjs/"
		].some((l) => id.includes(l))) files.forEach((asset) => ignoredAssets.add(asset));
	});
	modules.forEach((id) => {
		const files = manifest[id];
		if (files?.length) files.forEach((file) => {
			if (seen.has(file) || ignoredAssets.has(file)) return;
			seen.add(file);
			const filename = basename(file);
			if (manifest[filename]) {
				for (const depFile of manifest[filename]) if (!seen.has(depFile) && !ignoredAssets.has(depFile)) {
					links += renderPreloadLink(depFile);
					seen.add(depFile);
				}
			}
			links += renderPreloadLink(file);
		});
	});
	return links;
}
//#endregion
export { fileToRoute, findLayouts, generateComponentRoute, generateRoute, generateRouteProloaders, getRoutes, globFiles, processLayoutRoutes, renderPreloadLinks, renderToString, scanRoutes };

//# sourceMappingURL=server.mjs.map