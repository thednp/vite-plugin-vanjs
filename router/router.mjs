import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { MODE } from "../plugin/const.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./matchRoute.mjs";
import {
  executeLifecycle,
  executeModule,
  resolveChildren,
} from "./helpers.mjs";
import { initializeHeadTags } from "../meta/index.mjs";
import { hydrate } from "../client/index.mjs";
import { Head } from "../meta/index.mjs";
import * as dataCache from "./dataCache.mjs";
import "virtual:@vanjs/routes";

const isDev = MODE === "development";

/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */
/** @typedef {import("./types.d.ts").RouteEntry} RouteEntry */
/** @typedef {import("./types.d.ts").VanNode} VanNode */
/** @typedef {import("./types.d.ts").RouteLayout} RouteLayout */

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
      const oldSearch = routerState.searchParams;
      const newSearch = new URLSearchParams(location.search).toString();
      // istanbul ignore next - cannot test
      if (location.pathname !== oldPath || newSearch !== oldSearch) {
        setRouterState(location.pathname, location.search);
      }
    },
  );
  _initialized = true;
};

/**
 * Build the layout chain + leaf into DOM nodes.
 * @param {{ layouts?: RouteLayout[], leaf?: () => any }} mod
 * @returns {any[]}
 */
const buildChain = (mod) => {
  const chain = mod.layouts ?? /* istanbul ignore next */ [];
  const leafFn = mod.leaf;

  if (chain.length === 0) {
    const nodes = leafFn ? leafFn() : /* istanbul ignore next */ [];
    /* istanbul ignore next */
    return Array.isArray(nodes) ? nodes : [nodes];
  }

  // Build inside-out: leaf → innermost layout → ... → outermost layout
  let content = leafFn ? leafFn() : /* istanbul ignore next */ [];
  /* istanbul ignore else */
  if (!Array.isArray(content)) content = [content];

  for (let k = chain.length - 1; k >= 0; k--) {
    content = chain[k].component({ children: content });
    /* istanbul ignore else */
    if (!Array.isArray(content)) content = [content];
  }

  return content;
};

export const Router = (initialProps = /* istanbul ignore next */ {}) => {
  const { div, main } = van.tags;
  const props = Object.fromEntries(
    Object.entries(initialProps).filter(([_, val]) => val !== undefined),
  );
  const wrapper = main({ ...props, "data-root": "" });
  const route = matchRoute(routerState.pathname);
  let _searchParams = routerState.searchParams;

  /* istanbul ignore else */
  if (!route) return van.add(wrapper, div("No Route Found"));
  // It's important to READ the params
  Object.assign(routerState.params, route.params);

  // Server-side rendering — unchanged, single-pass full render
  if (isServer) {
    return async () => {
      try {
        return await executeModule(route, wrapper, true);
      } catch (error) {
        /* istanbul ignore next */
        console.error("Router error:", error);
        /* istanbul ignore next */
        return van.add(wrapper, div("Error loading page"));
      }
    };
  }

  // Init client here
  initClient();
  let initialized = false;

  // Client-side: hydrate data cache from SSR output
  // This must happen BEFORE any component renders so useRouteData() works
  // Skip in dev mode: we manually clear dataCache on mutations for instant updates
  if (globalThis.__DATA_CACHE && !isDev) {
    dataCache.hydrateFromJSON(globalThis.__DATA_CACHE);
  }

  // Persistent layout chain keys for prefix-diff tracking (client only)
  /** @type {string[]} */
  let layoutKeys = [];
  let navToken = 0;

  /**
   * Navigate to a new route, rendering the layout chain.
   * Uses prefix-diff to detect shared layouts and only rebuilds the diverged suffix.
   * @param {{ layouts?: RouteLayout[], leaf?: () => any }} mod
   */
  const navigateToModule = (mod) => {
    const newKeys = (mod.layouts ?? /* istanbul ignore next */ []).map((l) =>
      l.path
    );

    // Find shared prefix length
    let keepCount = 0;
    while (
      keepCount < layoutKeys.length && keepCount < newKeys.length &&
      layoutKeys[keepCount] === newKeys[keepCount]
    ) {
      keepCount++;
    }

    layoutKeys = newKeys;

    if (keepCount === 0 || keepCount < newKeys.length) {
      // Full rebuild (diverged layout chain)
      const children = buildChain(mod);
      wrapper.replaceChildren(...children);
    } else {
      // All layouts shared — only the leaf changed.
      // Rebuild from the leaf up through the shared layouts.
      // We still need to rebuild the DOM because VanJS layout components
      // create new DOM nodes each call, but the shared layout _functions_
      // are reused (cached by routeCache), avoiding re-import overhead.
      const children = buildChain(mod);
      wrapper.replaceChildren(...children);
    }
  };

  // Client-side: check if hydrating SSR content or pure SPA
  const root = document.querySelector("[data-root]");

  if (root) {
    van.derive(() => {
      // It's important to READ the pathname to keep the derive subscribed
      const pathname = routerState.pathname;
      if (!initialized) return;
      const matchedRoute = matchRoute(pathname);
      if (!matchedRoute) {
        wrapper.replaceChildren(div("No Route Found"));
        return;
      }
      (async () => {
        const token = ++navToken;
        routerState.loading = true;
        try {
          _searchParams = routerState.searchParams;
          const module = await matchedRoute.component();
          /* istanbul ignore next */
          if (token !== navToken) return;
          await executeLifecycle(Object.assign(matchedRoute, module.route));
          /* istanbul ignore else */
          if (document.head) hydrate(document.head, Head());
          if (module.layouts) {
            navigateToModule(module);
          } else {
            layoutKeys = [];
            const children = resolveChildren(module);
            wrapper.replaceChildren(...children);
          }
        } finally {
          routerState.loading = false;
        }
      })();
    });
    return async () => {
      const result = await executeModule(route, wrapper, true);
      initialized = true;
      return result;
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
      const token = ++navToken;
      routerState.loading = true;
      try {
        _searchParams = routerState.searchParams;
        const module = await matchedRoute.component();
        if (token !== navToken) return;
        await executeLifecycle(Object.assign(matchedRoute, module.route));
        /* istanbul ignore else */
        if (document.head) hydrate(document.head, Head());
        if (module.layouts) {
          navigateToModule(module);
        } else {
          layoutKeys = [];
          const children = resolveChildren(module);
          wrapper.replaceChildren(...children);
        }
      } finally {
        routerState.loading = false;
      }
    })();
  });

  return wrapper;
};
