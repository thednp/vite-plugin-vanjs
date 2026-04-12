/*!
* vite-plugin-vanjs Route Module v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { routes } from "vite-plugin-vanjs/router-routes";
import van from "@vanjs/van";
//#region src/setup/isServer.ts
const isServer = typeof window === "undefined";
//#endregion
//#region src/router/helpers.ts
function isLazyComponent(component) {
	if (isServer && typeof component === "function") return component.constructor.name.includes("AsyncFunction");
	return component?.isLazy === true;
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
	if (routes.some((r) => r.path === path)) {
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
		routes.push({
			...rest,
			path,
			component: wrappedComponent
		});
		return;
	}
	routes.push(routeProps);
}
//#endregion
export { Route };

//# sourceMappingURL=router-route.mjs.map