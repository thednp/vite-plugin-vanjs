import isServer from "../setup/isServer.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./matchRoute.mjs";

/** @typedef {typeof import("./types.d.ts").navigate} Navigate */
/** @typedef {import("./types.d.ts").Route} Route */
/** @typedef {import("./types.d.ts").VanNode} VanNode */
/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */
/** @typedef {import("./types.d.ts").DynamicModule} DynamicModule */
/** @typedef {import("./types.d.ts").ComponentFn} ComponentFn */
/** @typedef {import("./types.d.ts").LazyComponent} LazyComponent */

/**
 * Check if selected page is the current page;
 * @param {string} pageName
 * @returns {boolean}
 */
export const isCurrentPage = (pageName) => {
  return routerState.pathname.val === pageName;
};

/**
 * Check if component is a lazy component
 * @param {ComponentFn | (() => LazyComponent)} component
 * @returns {component is (() => LazyComponent)}
 */
export const isLazyComponent = (component) => {
  // Server: Check if it's an async function
  if (isServer && typeof component === "function") {
    return component.constructor.name.includes("AsyncFunction");
  }

  // Client: Check if it's designated as lazy
  // @ts-expect-error - this property is optional and on purpose
  return component?.isLazy === true;
};

/**
 * Execute lifecycle methods preload and / or load
 * @param {ComponentModule} param0
 * @param {Record<string, string> | undefined} params
 * @returns {Promise<boolean>}
 */
export const executeLifecycle = async ({ route }, params) => {
  // istanbul ignore next
  if (!route) return true;
  try {
    if (route?.preload) await route.preload(params);
    if (route?.load) await route.load(params);
    return true;
  } catch (error) {
    // istanbul ignore next
    console.error("Lifecycle execution error:", error);
    // istanbul ignore next
    return false;
  }
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
