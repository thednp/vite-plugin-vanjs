// router/state.js
import { reactive } from "vanjs-ext";
import setup from "../setup/index.mjs";

const initialPath = !setup.isServer ? window.location.pathname : '/'
const initialSearch = !setup.isServer ? window.location.search : ''

/**
 * @type {typeof import("./types.d.ts").routerState}
 */
export const routerState = reactive({
  pathname: initialPath,
  searchParams: new URLSearchParams(initialSearch),
})

/**
 * @type {typeof import("./types.d.ts").setRouterState}
 */
export const setRouterState = (href, replace = false) => {
  const urlParams = new URL(href);
  const { pathname, searchParams } = urlParams;

  if (!setup.isServer) {
    if (replace) window.history.replaceState({}, '', urlParams.toString());
    else window.history.pushState({}, '', urlParams.toString());
  }
  routerState.pathname = pathname;
  routerState.searchParams = searchParams;
}
