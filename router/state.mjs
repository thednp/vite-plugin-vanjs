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

/**
 * @param {T extends Record<string, unknown>} init
 * @returns {T}
 */
export function miniStore(init) {
  const target = {};
  for (const [prop, value] of Object.entries(init)) {
    if (
      value && typeof value === "object" &&
      Object.getPrototypeOf(value) === Object
    ) {
      for (const [sp, sv] of Object.entries(value)) {
        console.log({ sp, sv });

        target[prop] = defineProxy(sp, sv, {});
      }
    } else if (!Array.isArray(value)) {
      defineProxy(prop, value, target);
    } else {
      console.warn(typeof value + " is not supported.");
    }
    console.log({ prop, value });
  }
  return target;
}

/**
 * @type {typeof import("./types.d.ts").routerState}
 */
// export const routerState = {
//   pathname: van.state(initialPath),
//   searchParams: van.state(new URLSearchParams(initialSearch)),
//   params: van.state({}),
// };
export const routerState = miniStore({
  pathname: initialPath,
  searchParams: new URLSearchParams(initialSearch),
  params: {},
});

/**
 * @type {typeof import("./types.d.ts").setRouterState}
 */
export const setRouterState = (path, search = undefined, params) => {
  const [pathname, searchParams] = fixRouteUrl(path).split("?");
  routerState.pathname = pathname;
  routerState.searchParams = new URLSearchParams(
    search || searchParams || "",
  );
  Object.assign(routerState.params, params || {});
};
