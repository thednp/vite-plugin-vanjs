// router/routes.mjs
import { isLazyComponent } from "./helpers.mjs";
import { routes } from "./routes.mjs";
import { lazy } from "./lazy.mjs";
/** @typedef {import("./types.d.ts").RouteProps} RouteProps */
/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */

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
    /** @type {() => Promise<ComponentModule>} */
    const wrappedComponent = lazy(() =>
      Promise.resolve({
        Page: component,
        route: { preload, load },
      })
    );
    routes.push({ ...rest, path, component: wrappedComponent });
    return;
  }

  // Otherwise keep original component
  // @ts-expect-error - RouteProps and RouteEntry are now equivalent
  routes.push(routeProps);
};
