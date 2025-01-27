// router/state.js
import van from "vanjs-core";
import setup from "@vanjs/setup";

const initialPath = !setup.isServer ? globalThis.location.pathname : "/";
const initialSearch = !setup.isServer ? globalThis.location.search : "";

/**
 * @type {typeof import("./types.d.ts").routerState}
 */
export const routerState = {
  pathname: van.state(initialPath),
  searchParams: van.state(new URLSearchParams(initialSearch)),
  params: van.state({}),
};

/**
 * @type {typeof import("./types.d.ts").setRouterState}
 */
export const setRouterState = (path, search = undefined, params) => {
  const [pathname, searchParams] = path.split("?");
  routerState.pathname.val = pathname;
  routerState.searchParams.val = new URLSearchParams(
    search || searchParams || "",
  );
  routerState.params.val = params || {};
};
