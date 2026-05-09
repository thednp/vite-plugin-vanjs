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

/**
 * Normalize a search string to a plain string (strip leading "?")
 * @param {string} search
 * @returns {string}
 */
const normalizeSearch = (search) => {
  if (!search) return "";
  return search.startsWith("?") ? search.slice(1) : search;
};

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
      defineProxy(prop, value, target);
    } else if (!Array.isArray(value) && value != null) {
      defineProxy(prop, value, target);
    } else {
      console.warn(typeof value + " is not supported.");
    }
  }
  return target;
}

export const routerState = microStore({
  pathname: initialPath,
  searchParams: normalizeSearch(initialSearch),
  params: {},
  loading: false,
});

/**
 * @type {typeof import("./types.d.ts").setRouterState}
 */
export const setRouterState = (path, search = undefined, params = {}) => {
  const [pathname, searchPart] = fixRouteUrl(path).split("?");
  routerState.pathname = pathname;
  routerState.searchParams = normalizeSearch(search || searchPart || "");
  Object.keys(routerState.params).forEach((key) =>
    delete routerState.params[key]
  );
  Object.assign(routerState.params, params);
};
