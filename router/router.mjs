import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./matchRoute.mjs";
import { executeLifecycle } from "./helpers.mjs";
import { unwrap } from "./unwrap.mjs";
import { hydrate } from "../client/index.mjs";
import { Head, initializeHeadTags } from "../meta/index.mjs";
import * as dataCache from "./dataCache.mjs";
import "virtual:@vanjs/routes";

/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */
/** @typedef {import("./types.d.ts").RouteEntry} RouteEntry */
/** @typedef {import("./types.d.ts").VanNode} VanNode */

/**
 * Resolve component children from a module
 * @param {ComponentModule | Element | Element[] | any} module
 * @returns {VanNode[]}
 */
const resolveChildren = (module) => {
  const isElement = typeof Element !== "undefined" && module instanceof Element;
  const cp = (Array.isArray(module) || isElement)
    ? module
    : typeof module.component === "function"
    ? module.component()
    : module.component;
  return cp ? Array.from(unwrap(cp).children) : /* istanbul ignore next */ [];
};

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
 * Initialize client-side router (Head + popstate listener)
 */
let _initialized = false;
const initClient = () => {
  // istanbul ignore if - already initialized
  if (_initialized) return;

  initializeHeadTags();
  globalThis.addEventListener(
    "popstate",
    /** @param {Event & {target: globalThis}} e */
    (e) => {
      const location = e.target.location;
      const oldPath = routerState.pathname;
      // istanbul ignore next - cannot test
      if (location.pathname !== oldPath) {
        setRouterState(location.pathname, location.search);
      }
    },
  );
  _initialized = true;
};

export const Router = (initialProps = /* istanbul ignore next */ {}) => {
  const { div, main } = van.tags;
  const props = Object.fromEntries(
    Object.entries(initialProps).filter(([_, val]) => val !== undefined),
  );
  const wrapper = main({ ...props, "data-root": "" });
  const route = matchRoute(routerState.pathname);

  /* istanbul ignore else */
  if (!route) return van.add(wrapper, div("No Route Found"));

  Object.assign(routerState.params, route.params || {});

  // Server-side rendering
  if (isServer) {
    return async () => {
      try {
        // 1. Resolve the module first (to get route lifecycle hooks)
        const module = await route.component();

        // 2. Execute lifecycle
        await executeLifecycle(module.route, route.params);
        const children = resolveChildren(module);

        // 3. Render the component (data is now in dataCache)
        return van.add(wrapper, ...children);
      } catch (error) {
        /* istanbul ignore next */
        console.error("Router error:", error);
        /* istanbul ignore next */
        return van.add(wrapper, div("Error loading page"));
      }
    };
  }

  // Init client here
  if (!isServer) initClient();

  // Client-side: hydrate data cache from SSR output
  // This must happen BEFORE any component renders so useRouteData() works
  if (globalThis.__DATA_CACHE) {
    dataCache.hydrateFromJSON(globalThis.__DATA_CACHE);
  }

  // Client-side: check if hydrating SSR content or pure SPA
  const root = document.querySelector("[data-root]");

  if (root) {
    return async () => {
      const module = await route.component();

      await executeLifecycle(module.route, route.params);
      const children = resolveChildren(module)
      updateHead();
      return van.add(wrapper, ...children);
    };
  }

  // Pure SPA path - reactive routing
  van.derive(() => {
    const matchedRoute = matchRoute(routerState.pathname);
    if (!matchedRoute) {
      wrapper.replaceChildren(div("No Route Found"));
      return;
    }

    (async () => {
      const module = await matchedRoute.component();
      await executeLifecycle(module.route, matchedRoute.params);
      const children = resolveChildren(module);
      wrapper.replaceChildren(...children);
      updateHead();
    })();
  });

  return wrapper;
};
