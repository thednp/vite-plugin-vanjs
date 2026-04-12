/*!
* vite-plugin-vanjs Router v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import "virtual:@vanjs/routes";
import van from "@vanjs/van";
import { hydrate } from "@vanjs/client";
import { Head, initializeHeadTags } from "@vanjs/meta";
import { routes as routes$1 } from "vite-plugin-vanjs/router-routes";
//#region src/setup/isServer.ts
const isServer = typeof window === "undefined";
//#endregion
//#region src/router/state.ts
/**
* Fixes the URL of a route.
* @param url
*/
function fixRouteUrl(url) {
	if (!url) return "/";
	if (url.startsWith("/")) return url;
	return `/${url}`;
}
const initialPath = !isServer ? globalThis.location.pathname : "/";
const initialSearch = !isServer ? globalThis.location.search : "";
const routerState = {
	pathname: van.state(initialPath),
	searchParams: van.state(new URLSearchParams(initialSearch)),
	params: van.state({})
};
/**
* Sets the router state to the specified href.
* @param href the URL to navigate to
* @param search the search string
* @param params the route params object
*/
function setRouterState(path, search, params) {
	const [pathname, searchParams] = fixRouteUrl(path).split("?");
	routerState.pathname.val = pathname;
	routerState.searchParams.val = new URLSearchParams(search || searchParams || "");
	routerState.params.val = params || {};
}
//#endregion
//#region src/router/extractParams.ts
function extractParams(pattern, path) {
	const params = {};
	const patternParts = pattern.split("/");
	const pathParts = path.split("/");
	if (patternParts.length !== pathParts.length) return null;
	for (let i = 0; i < patternParts.length; i++) {
		const patternPart = patternParts[i];
		const pathPart = pathParts[i];
		if (patternPart.startsWith(":")) params[patternPart.slice(1)] = pathPart;
		else if (patternPart !== pathPart) return null;
	}
	return params;
}
//#endregion
//#region src/router/matchRoute.ts
/**
* Find a registered route that matches the given path
*/
function matchRoute(initialPath) {
	const path = initialPath !== "/" && initialPath.endsWith("/") ? initialPath.slice(0, -1) : initialPath;
	let foundMatch = routes$1.find((r) => r.path === path && !r.path.includes("*"));
	if (!foundMatch) {
		const nestedPath = path.split("/").slice(0, -1).join("/") + "/*";
		foundMatch = routes$1.find((r) => r.path === nestedPath);
	}
	if (foundMatch) return {
		...foundMatch,
		params: extractParams(foundMatch.path, path) ?? void 0
	};
	for (const route of routes$1) {
		if (route.path === "*") continue;
		const params = extractParams(route.path, path);
		if (params) return {
			...route,
			params
		};
	}
	return routes$1.find((r) => r.path === "*") || null;
}
//#endregion
//#region src/router/helpers.ts
function isCurrentPage(pageName) {
	return routerState.pathname.val === pageName;
}
const isCurrentLocation = (pageName) => {
	const pathName = routerState.pathname.val;
	return pathName !== "/" && pathName.includes(pageName);
};
function isLazyComponent(component) {
	if (isServer && typeof component === "function") return component.constructor.name.includes("AsyncFunction");
	return component?.isLazy === true;
}
/**
* Execute lifecycle methods preload and / or load
*/
const executeLifecycle = async (module, params) => {
	const { route } = module instanceof Promise ? await module : module;
	if (!route) return true;
	try {
		if (route?.preload) await route.preload(params);
		if (route?.load) await route.load(params);
		return true;
	} catch (error) {
		console.error("Lifecycle execution error:", error);
		return false;
	}
};
/**
* Navigates to the specified href in the client and sets the router state.
* Keep in mind that the router handles the search params and hash.
*
* @param href the URL to navigate to
* @param options when true, will replace the current history entry
*/
function navigate(path, options = {}) {
	const { replace = false } = options;
	if (!isServer) {
		const url = new URL(path, globalThis.location.origin);
		const route = matchRoute(url.pathname);
		if (replace) globalThis.history.replaceState({}, "", path);
		else globalThis.history.pushState({}, "", path);
		setRouterState(url.pathname, url.search, route?.params);
	} else console.error("Direct navigation is not supported on server");
}
/**
* A client only helper function that reloads the current page.
*/
/**
* A helper function that redirects the user to the specified href.
* When called in the server, it will return a function that will redirect the user
* to the specified href when called.
* @param {string | undefined} href the URL to redirect to
*/
//#endregion
//#region src/router/unwrap.ts
/**
* Merge the children of an Element or an array of elements with an optional array of children
* into the childen prperty of a simple object.
* @param source
* @param children
*/
const unwrap = (source, ...children) => {
	const pageChildren = source && typeof source === "object" && "children" in source && Array.isArray(source.children) ? source.children : typeof source === "function" ? [...source()?.children || source()] : typeof HTMLElement !== "undefined" && source instanceof HTMLElement ? [...source.children] : Array.isArray(source) ? source : [source];
	return { children: [...children, ...pageChildren] };
};
//#endregion
//#region src/router/router.ts
let _initialized = false;
const initClient = () => {
	if (_initialized) return;
	initializeHeadTags();
	globalThis.addEventListener("popstate", (e) => {
		const location = e.target.location;
		const oldPath = routerState.pathname.oldVal;
		if (location.pathname !== oldPath) setRouterState(location.pathname, location.search);
	});
	_initialized = true;
};
const Router = (initialProps = {}) => {
	const { div, main } = van.tags;
	const wrapper = main({
		...Object.fromEntries(Object.entries(initialProps).filter(([, val]) => val !== void 0)),
		"data-root": true
	});
	if (!isServer) initClient();
	const route = matchRoute(routerState.pathname.val);
	if (!route) return van.add(wrapper, div("No Route Found"));
	routerState.params.val = route.params || {};
	if (isServer) return (async () => {
		try {
			const module = await route.component();
			await executeLifecycle(module, route.params);
			return van.add(wrapper, ...unwrap(module.component).children);
		} catch (error) {
			console.error("Router error:", error);
			return van.add(wrapper, div("Error loading page"));
		}
	})();
	if (document.querySelector("[data-root]")) {
		const moduleReturn = async () => {
			const module = await route.component();
			await executeLifecycle(module, route.params);
			const children = unwrap(module.component).children;
			if (document.head) van.hydrate(document.head, (head) => hydrate(head, Head()));
			return van.add(wrapper, ...children);
		};
		return moduleReturn();
	}
	van.derive(() => {
		const route = matchRoute(routerState.pathname.val);
		if (!route) {
			wrapper.replaceChildren(div("No Route Found"));
			return;
		}
		const moduleReturn = async () => {
			const module = await route.component();
			await executeLifecycle(module, route.params);
			const children = unwrap(module.component).children;
			if (document.head) van.hydrate(document.head, (head) => hydrate(head, Head()));
			return van.add(wrapper, ...children);
		};
		moduleReturn();
	});
	return wrapper;
};
//#endregion
//#region src/router/routes.ts
const routes = [];
//#endregion
//#region src/router/cache.ts
const routeCache = /* @__PURE__ */ new Map();
/**
* Return a route cache.
* @param key the cache route key
*/
function getCached(key) {
	return routeCache.get(key);
}
/**
* Cache a route.
* @param key the cache route key
* @param value the cache route
*/
function cache(key, value) {
	routeCache.set(key, value);
}
//#endregion
//#region src/router/lazy.ts
/**
* Registers a lazy component.
* @param importFn
*/
function lazy(importFn) {
	if (isServer) return async () => {
		const cached = getCached(importFn);
		if (cached) return cached;
		const module = await importFn();
		const result = {
			component: module?.default ?? module.Page ?? (() => null),
			route: module.route
		};
		cache(importFn, result);
		return result;
	};
	let initialized = false;
	const component = van.state(() => "Loading..");
	const route = van.state({});
	const load = () => {
		if (initialized) return;
		const cached = getCached(importFn);
		if (cached) {
			component.val = cached.component;
			route.val = cached.route ?? {};
			return;
		}
		initialized = true;
		importFn().then((mod) => {
			const module = mod;
			const pageComponent = module?.default ?? module.Page ?? (() => null);
			cache(importFn, {
				component: pageComponent,
				route: module.route
			});
			component.val = pageComponent;
			route.val = module.route ?? {};
		});
	};
	const lazyComponent = () => {
		load();
		return {
			component: component.val(),
			route: route.val
		};
	};
	lazyComponent.isLazy = true;
	return lazyComponent;
}
//#endregion
//#region src/router/route.ts
/**
* Registers a new route in the router state.
* @param route the route to register
*
* @example
* import { Route, lazy } from '@vanjs/router';
* import Home from './pages/Home';
* import NotFound from './pages/NotFound';
*
* Route({ path: '/', component: Home });
* Route({ path: '/about', component: lazy(() => import("./pages/About.ts")) });
* Route({ path: '*', component: NotFound });
*/
function Route(routeProps) {
	const { path, component, preload, load, ...rest } = routeProps;
	if (routes$1.some((r) => r.path === path)) {
		console.error(`🍦 @vanjs/router: duplicated route for "${path}".`);
		return;
	}
	if (!isLazyComponent(component)) {
		const wrappedComponent = lazy(() => Promise.resolve({
			Page: component,
			route: {
				preload,
				load
			}
		}));
		routes$1.push({
			...rest,
			path,
			component: wrappedComponent
		});
		return;
	}
	routes$1.push(routeProps);
}
//#endregion
//#region src/router/a.ts
const A = ({ href, children, ...rest } = {}, ...otherChildren) => {
	const props = Object.fromEntries(Object.entries(rest || {}).filter(([_, val]) => val !== void 0));
	const newProps = {
		href,
		...props,
		onclick: async (e) => {
			e.preventDefault();
			const HREF = typeof href === "function" ? href() : typeof href === "object" ? href.val : href;
			if (isCurrentPage(HREF)) return;
			if (props.onclick) props.onclick(e);
			const route = matchRoute(HREF);
			const module = await route?.component();
			if (route && module) {
				await executeLifecycle(module, route.params);
				navigate(HREF);
			}
		},
		onmouseenter: () => {
			const route = matchRoute(typeof href === "function" ? href() : href);
			if (route?.component) route.component();
		}
	};
	van.derive(() => {
		const HREF = typeof href === "function" ? href() : typeof href === "object" ? href.val : href;
		const isPage = isCurrentPage(HREF);
		const isLocation = isCurrentLocation(HREF);
		if (isPage || isLocation) newProps.ariaCurrent = isPage ? "page" : "location";
	});
	return van.tags.a(newProps, children || otherChildren);
};
//#endregion
export { A, Route, Router, cache, executeLifecycle, extractParams, fixRouteUrl, getCached, isCurrentLocation, isCurrentPage, isLazyComponent, lazy, navigate, routerState, routes, setRouterState, unwrap };

//# sourceMappingURL=router.mjs.map