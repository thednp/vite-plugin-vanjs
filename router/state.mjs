// router/state.js
import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { fixRouteUrl } from "./helpers.mjs";

const initialPath = !isServer ? globalThis.location.pathname : "/";
const initialSearch = !isServer ? globalThis.location.search : "";

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
  const [pathname, searchParams] = fixRouteUrl(path).split("?");
  routerState.pathname.val = pathname;
  routerState.searchParams.val = new URLSearchParams(
    search || searchParams || "",
  );
  routerState.params.val = params || {};
};
