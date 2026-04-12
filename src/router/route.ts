import { routes } from "vite-plugin-vanjs/router-routes";
import type { RouteProps } from "./types.d.ts";
import { isLazyComponent } from "./helpers.ts";
import { lazy } from "./lazy.ts";

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
export function Route(routeProps: RouteProps): void {
  const { path, component, preload, load, ...rest } = routeProps;

  if (routes.some((r) => r.path === path)) {
    console.error(`🍦 @vanjs/router: duplicated route for "${path}".`);
    return;
  }

  if (!isLazyComponent(component)) {
    const wrappedComponent = lazy(() =>
      Promise.resolve({
        Page: component,
        route: { preload, load },
      })
    );
    routes.push({ ...rest, path, component: wrappedComponent });
    return;
  }

  routes.push(routeProps as never);
}
