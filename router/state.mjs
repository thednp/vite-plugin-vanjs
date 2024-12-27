// router/state.js
import van from "vanjs-core";
import setup from "../setup/index.mjs";

const initialPath = !setup.isServer ? window.location.pathname : '/'
const initialSearch = !setup.isServer ? window.location.search : ''

/**
 * @type {typeof import("./types.d.ts").routerState}
 */
export const routerState = {
  pathname: van.state(initialPath),
  searchParams: van.state(new URLSearchParams(initialSearch)),
}

/**
 * @type {typeof import("./types.d.ts").setRouterState}
 */
export const setRouterState = (url = '/', replace = false) => {
  const [pathname, search] = url.split('?');
  const searchParams = new URLSearchParams(search);
  const newState = pathname + searchParams.toString();

  if (!setup.isServer) {
    if (replace) window.history.replaceState({}, '', newState);
    else window.history.pushState({}, '', newState);
  }
  routerState.pathname.val = pathname;
  routerState.searchParams.val = searchParams;
}
