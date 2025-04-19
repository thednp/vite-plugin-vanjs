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
  if (routes.some((r) => r.path === path)) {
    console.error(`🍦 @vanjs/router: duplicated route for "${path}".`);
    return;
  }

  // If component isn't lazy, make it lazy
  if (!isLazyComponent(component)) {
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
 * @param {string} initialPath
 * @returns {RouteEntry | null}
 */
export const matchRoute = (initialPath) => {
  const path = initialPath !== "/" && initialPath.endsWith("/")
    ? initialPath.slice(0, -1)
    : initialPath;
  // identify a nested not-found route
  const nestedNotFound = path.split("/").slice(0, -1).join("/") + "/*";
  const exactMatch = routes.find((r) =>
    r.path === nestedNotFound || r.path === path
  );

  if (exactMatch) {
    return {
      ...exactMatch,
      params: extractParams(exactMatch.path, path),
    };
  }

  // identify any other route
  for (const route of routes) {
    if (route.path === "*") continue;
    const params = extractParams(route.path, path);

    if (params) {
      return { ...route, params };
    }
  }

  // fallback to default not-found route
  return routes.find((r) => r.path === "*") || null;
};
