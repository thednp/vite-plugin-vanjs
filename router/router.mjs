// router/Router.js
import van from "vanjs-core"
import setup from "../setup/index.mjs";
import { routerState, setRouterState } from './state.mjs'
import { matchRoute } from './routes.mjs'

/** @typedef {import('./types.d.ts').PopEvent} PopEvent */
/** @typedef {import('./types.d.ts').LoadEvent} LoadEvent */
/** @typedef {import('./types.d.ts').Route["component"]} PageComponent */

/** @param {LoadEvent | PopEvent} e */
const hrefCallback = (e) => setRouterState(e.target.location.href);

export const Router = () => {
  if (!setup.isServer) {
    window.addEventListener('popstate', hrefCallback);
    window.onload = hrefCallback;
  }

  return () => {
    /** @type {PageComponent | undefined} */
    const Page = matchRoute(routerState.pathname);
    return Page ? Page() : van.div("Page not found");
  }
}
