import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./matchRoute.mjs";
import { unwrap } from "./unwrap.mjs";
import { hydrate } from "../client/index.mjs";
import { Head } from "../meta/index.mjs";

import * as dataCache from "./dataCache.mjs";

/** @typedef {typeof import("./types.d.ts").navigate} Navigate */
/** @typedef {import("./types.d.ts").SearchParamDef} SearchParamDef */
/** @typedef {import("./types.d.ts").Route} Route */
/** @typedef {import("./types.d.ts").VanNode} VanNode */
/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */
/** @typedef {import("./types.d.ts").ComponentFn} ComponentFn */
/** @typedef {import("./types.d.ts").LazyComponent} LazyComponent */

/**
 * Update head tags
 */
const updateHead = () => {
  // istanbul ignore else
  if (document.head) {
    hydrate(document.head, Head());
  }
};

/**
 * Resolve component children from a module
 * @param {ComponentModule | Element | Element[] | any} module
 * @returns {VanNode[]}
 */
export const resolveChildren = (module) => {
  const isElement = typeof Element !== "undefined" && module instanceof Element;
  const cp = (Array.isArray(module) || isElement)
    ? module
    : typeof module.component === "function"
    ? module.component()
    : module.component;
  return cp ? Array.from(unwrap(cp).children) : /* istanbul ignore next */ [];
};

/**
 * Returns the HREF string value
 * @param {unknown} v
 * @returns {string}
 */
export const getValue = (v) => {
  return typeof v === "function" ? v() : v.rawVal ? v.val : v;
};

export const getCacheKey = () => {
  const params = routerState.params;
  const search = routerState.searchParams;
  return Object.keys(params).length === 0
    ? search || ""
    : JSON.stringify(params) + (search ? `&${search}` : "");
};

/**
 * Check if selected page is the current page;
 * @param {string} pageName
 * @returns {boolean}
 */
export const isCurrentPage = (pageName) => {
  const href = getValue(pageName);
  const url = new URL(href, "http://localhost:5173");
  // console.log({ href }, routerState.searchParams, url.searchParams.toString())
  return routerState.pathname === url.pathname &&
    routerState.searchParams === url.searchParams.toString();
};

/**
 * Check if selected page is related to the current page;
 * @param {string} pageName
 * @returns {boolean}
 */
export const isCurrentLocation = (pageName) => {
  const href = getValue(pageName);
  const searchParams = new URLSearchParams(routerState.searchParams);
  const pathname = routerState.pathname;
  const url = new URL(href, "http://localhost:5173");
  return url.pathname !== "/" && pathname.includes(url.pathname) ||
    pathname === url.pathname && searchParams.size > 0;
};

/**
 * Check if component is a lazy component
 * @param {ComponentFn | (() => LazyComponent)} component
 * @returns {component is (() => LazyComponent)}
 */
export const isLazyComponent = (component) => {
  if (typeof component !== "function") return false;
  // @ts-expect-error - this property is optional and on purpose
  return component?.isLazy === true ||
    component.constructor.name.includes("AsyncFunction");
};

/**
 * Execute lifecycle methods preload and / or load
 * @param {import("./types.d.ts").RouteEntry} route
 * @returns {Promise<boolean>}
 */
export const executeLifecycle = async (route) => {
  // istanbul ignore next
  try {
    if (!route) return true;

    let data;
    const preload = route.preload;
    const load = route.load;

    const pathname = routerState.pathname;
    const cacheKey = getCacheKey();

    if (preload) await preload(route.params);
    if (!data && load && !dataCache.has(pathname, cacheKey)) {
      data = await load(route.params);
    } else if (load && dataCache.has(pathname, cacheKey)) {
      dataCache.touch(pathname);
    }
    if (data) {
      dataCache.set(pathname, cacheKey, {
        data,
        error: null,
        status: "success",
        timestamp: Date.now(),
      });
      if (!isServer) {
        dataCache.touch(pathname);
      }
    }

    return true;
  } catch (error) {
    // istanbul ignore next
    console.error("Lifecycle execution error:", error);
    // istanbul ignore next
    return false;
  }
};

/**
 * @param {RouteEntry} route
 * @param {HTMLElement} wrapper
 * @param {boolean} ssr
 * @returns
 */
export const executeModule = async (route, wrapper, ssr) => {
  if (routerState.loading === true) return;
  // 0. Set Loading State
  routerState.loading = true;
  // 1. Resolve the module first (to get route lifecycle hooks)
  const module = await route.component();
  // 2. Execute lifecycle (a complete route includes all props)
  await executeLifecycle(Object.assign(route, module.route));
  // 3. Resolve children
  const children = resolveChildren(module);
  // 4. Update <head> in the client
  if (!isServer) updateHead();
  // 5. Set Loading State
  routerState.loading = false;
  // 6. Update / replace children in wrapper
  if (ssr) return van.add(wrapper, ...children);
  else wrapper.replaceChildren(...children);
};

/**
 * Convenience hook to get the current route's cached data.
 * @returns {any | undefined}
 */
export const useRouteData = () => {
  const key = getCacheKey();
  return dataCache.get(routerState.pathname, key)?.data;
};

/**
 * Client only navigation utility.
 * @type {Navigate}
 */
export const navigate = (path, options = {}) => {
  const { replace = false } = options;

  // istanbul ignore else
  if (!isServer) {
    // Client-side navigation
    const url = new URL(path, globalThis.location.origin);
    const route = matchRoute(url.pathname);

    // Update history
    if (replace) {
      globalThis.history.replaceState({}, "", path);
    } else {
      globalThis.history.pushState({}, "", path);
    }

    // Update router state
    setRouterState(url.pathname, url.search, route?.params);
  } else {
    // Server-side navigation - throw error
    console.error("Direct navigation is not supported on server");
  }
};

/**
 * Client only reload utility
 * WORK IN PROGRESS
 * @param {boolean} forceFetch - Force fetch from server
 * @returns {void}
 */
// export const reload = (forceFetch = false) => {
//   if (!isServer) {
//     // Client-side reload
//     if (forceFetch) {
//       window.location.reload();
//     } else {
//       // Soft reload - just update router state
//       const { pathname, search } = window.location;
//       setRouterState(pathname, search);
//     }
//   } else {
//     // Server-side reload - throw error
//     console.error("Reload is not supported on server");
//   }
// };

/**
 * Isomorphic redirect utility
 * WORK IN PROGRESS
 * @param {string} path - The path to redirect to
 * @param {object} options - Redirect options
 * @param {number} options.status - HTTP status code (server-side only)
 * @param {boolean} options.replace - Whether to replace current history entry (client-side only)
 * @returns {void}
 */
// export const redirect = (path, options = {}) => {
//   const { status = 302, replace = true } = options;

//   if (!isServer) {
//     // Client-side redirect
//     navigate(path, { replace });
//   } else {
//     // Server-side redirect
//     const error = new Error(`Redirect to ${path}`);
//     error.status = status;
//     error.location = path;
//     throw error;
//   }
// };

// Utility to handle server-side redirects in your server entry point
// export const handleServerRedirect = (error, res) => {
//   if (error.location && error.status) {
//     res.writeHead(error.status, {
//       Location: error.location,
//       "Content-Type": "text/plain",
//     });
//     res.end(`Redirecting to ${error.location}...`);
//     return true;
//   }
//   return false;
// };
