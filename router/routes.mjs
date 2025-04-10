// router/routes.mjs
import { extractParams, isLazyComponent } from "./helpers.mjs";
import { lazy } from "./lazy.mjs";

/** @typedef {import("./types.d.ts").RouteEntry} RouteEntry */
/** @typedef {import("./types.d.ts").RouteProps} RouteProps */

/** @type {RouteEntry[]} */
export const routes = [];

/**
 * @param {RouteProps} routeProps
 */
export const Route = (routeProps) => {
  const { path, component, preload, load, ...rest } = routeProps;

  // istanbul ignore next - no point testing this error
  if (path === "/" && isLazyComponent(component)) {
    throw new Error("Home component must not be a lazy component");
  }

  // If component has lifecycle methods but isn't lazy, make it lazy
  if (!isLazyComponent(component) && path !== "/") {
    const wrappedComponent = lazy(() =>
      Promise.resolve({
        default: component,
        route: { preload, load },
      })
    );
    routes.push({ ...rest, path, component: wrappedComponent });
    return;
  }

  // Otherwise keep original component
  routes.push(routeProps);
};

/**
 * Find a registered route that matches the given path
 * @param {string} path
 * @returns {RouteEntry | null}
 */
export const matchRoute = (path) => {
  const exactMatch = routes.find((r) => r.path === path);
  if (exactMatch) return { ...exactMatch, params: {} };

  for (const route of routes) {
    if (route.path === "*") continue;
    const params = extractParams(route.path, path);
    if (params) {
      return { ...route, params };
    }
  }

  return routes.find((r) => r.path === "*") || null;
};
