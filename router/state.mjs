// router/state.js
import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";

/**
 * Fix the URL of a route
 * @param {string=} url
 * @returns
 */
export const fixRouteUrl = (url) => {
  if (!url) return "/";
  if (url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
};

const initialPath = !isServer ? globalThis.location.pathname : "/";
const initialSearch = !isServer ? globalThis.location.search : "";

const STATE_PROXY = "_proxy";
const proxyProps = {
  value: 1,
  enumerable: false,
  configurable: false,
  writable: false,
};

/**
 * @param {number | Omit<keyof T, "symbol">} key
 * @param {T[keyof T]} value
 * @param {Record<string, string | number>} target
 * @returns {T}
 */
const defineProxy = (key, value, target) => {
  const stateObj = van.state(value);

  const getter = () => stateObj.val;
  const setter = (newVal) => {
    stateObj.val = newVal;
  };
  stateObj.val = value;

  Object.defineProperties(target, {
    [STATE_PROXY]: proxyProps,
    [key]: {
      get: getter,
      set: setter,
      enumerable: true,
    },
  });

  return stateObj;
};

/** @typedef  */

/**
 * @template {Record<string, unknown>} T
 * @param {T} init
 * @returns {T}
 */
export function microStore(init) {
  /** @type {T} */
  const target = {};
  for (const [prop, value] of Object.entries(init)) {
    const isPlainObject = value && typeof value === "object" &&
      !Array.isArray(value) && Object.getPrototypeOf(value) === Object;

    if (isPlainObject && Object.keys(value).length > 0) {
      for (const [sp, sv] of Object.entries(value)) {
        target[prop] = defineProxy(sp, sv, {});
      }
    } else if (isPlainObject) {
      target[prop] = value;
    } else if (!Array.isArray(value) && value != null) {
      defineProxy(prop, value, target);
    } else {
      console.warn(typeof value + " is not supported.");
    }
  }
  return target;
}

/**
 * @type {typeof import("./types.d.ts").routerState}
 */
const initialStatus = isServer
  ? "success"
  : (globalThis.__DATA_CACHE ? "success" : "idle");

export const routerState = microStore({
  pathname: initialPath,
  searchParams: new URLSearchParams(initialSearch),
  params: {},
  status: initialStatus,
});

/**
 * @type {typeof import("./types.d.ts").setRouterState}
 */
export const setRouterState = (path, search = undefined, params = {}) => {
  const [pathname, searchParams] = fixRouteUrl(path).split("?");
  routerState.pathname = pathname;
  routerState.searchParams = new URLSearchParams(
    search || searchParams || "",
  );
  Object.keys(routerState.params).forEach((key) =>
    delete routerState.params[key]
  );
  Object.assign(routerState.params, params);
};
