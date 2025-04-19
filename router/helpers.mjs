// import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./routes.mjs";

/** @typedef {import("./types.d.ts").Route} Route */
/** @typedef {import("./types.d.ts").VanNode} VanNode */
/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */
/** @typedef {import('vanjs-core').TagFunc} TagFunc */

/**
 * Check if selected page is the current page;
 * @param {string} pageName
 * @returns {boolean}
 */
export const isCurrentPage = (pageName) => {
  return routerState.pathname.val === pageName;
};

/**
 * Merge the children of an Element or an array of elements with an optional array of children
 * into the childen of a single HTMLFragmentElement element.
 * @param {Element | () => Element | Element[]} source
 * @param  {...Element[]} children
 * @returns {TagFunc<HTMLFragmentElement> | HTMLElement}
 */
export const unwrap = (source, ...children) => {
  const layout = () => {
    const pageChildren = Array.isArray(source?.children)
      ? source.children
      : typeof source === "function"
      ? [...source()?.children || source()]
      : typeof HTMLElement !== "undefined" && source instanceof HTMLElement
      ? [...source.children]
      : /* istanbul ignore next */ Array.isArray(source)
      ? source
      : [source];

    // return van.tags.fragment(
    // ...(children || /* istanbul ignore next */ []),
    // ...pageChildren,
    // );
    return {
      children: [
        ...(children || /* istanbul ignore next */ []),
        ...pageChildren,
      ],
    };
  };
  return layout();
};

/**
 * Check if component is a lazy component
 * @param {unknown} component
 * @returns {component is (() => Promise<VanNode | VanNode[]>)}
 */
export const isLazyComponent = (component) => {
  // Server: Check if it's an async function
  if (isServer) {
    return component.constructor.name.includes("AsyncFunction");
  }

  // Client: Check if it's designated as lazy
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
 * @param {string} path - The path to navigate to
 * @param {{ replace: boolean } | undefined} options - Navigation options
 * @param {boolean} options.replace - Whether to replace current history entry
 * @returns {void}
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
 * Extract route params
 * @param {string} pattern
 * @param {string} path
 * @returns {Record<string, string>}
 */
export const extractParams = (pattern, path) => {
  const params = {};
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return null;

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
};

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
