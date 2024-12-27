// router/Router.js
import setup from "../setup/index.mjs";
import { routerState, setRouterState } from './state.mjs'
import { matchRoute } from './routes.mjs'

/** @typedef {import('./types.d.ts').Route["component"]} PageComponent */

export const Router = () => {
  if (!setup.isServer) {
    const hrefCallback = () => {
      const { pathname, search } = window.location;
      setRouterState(pathname + (search ? `?${search}` : ''));
    }
    window.addEventListener('popstate', hrefCallback);
    window.onload = hrefCallback;
  }

  /** @type {PageComponent | undefined} */
  const Page = matchRoute(routerState.pathname.val);
  const routeComponents = Page();
  return Array.isArray(routeComponents) ? routeComponents : [routeComponents];
}
