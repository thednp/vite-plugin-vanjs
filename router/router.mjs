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
import { markHydrationComplete } from "../setup/helpers.mjs";
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
 * @param {HTMLElement} outlet
 * @returns {import("@vanjs/router").DOMElement[]}
 */
const buildChain = (mod, outlet) => {
  const chain = mod.layouts ?? /* istanbul ignore next */ [];
  const leafFn = mod.leaf;

  if (chain.length === 0) {
    const nodes = leafFn ? leafFn() : /* istanbul ignore next */ [];
    /* istanbul ignore next */
    return Array.isArray(nodes) ? nodes.flat() : [nodes];
  }

  // Fill the outlet with the leaf content
  const raw = leafFn ? leafFn() : /* istanbul ignore next */ [];
  /* istanbul ignore else */
  const leafContent = Array.isArray(raw) ? raw.flat() : raw;
  if (Array.isArray(leafContent)) {
    outlet.replaceChildren(...leafContent);
  } else {
    outlet.replaceChildren(leafContent);
  }

  // Build outside-in: outermost layout wraps innermost → ... → leaf outlet
  let content = [outlet];
  for (let k = chain.length - 1; k >= 0; k--) {
    content = chain[k].component({ children: content });
    /* istanbul ignore next */
    if (!Array.isArray(content)) content = [content];
    // JSX Fragments return their children array directly, so a layout
    // returning [<>...</>] produces [[...]] (nested). flatten() ensures
    // replaceChildren always receives a flat list of DOM nodes.
    content = content.flat();
  }

  return content;
};

export const Router = (initialProps = /* istanbul ignore next */ {}) => {
  const { div, main } = van.tags;
  const props = Object.fromEntries(
    Object.entries(initialProps).filter(([_, val]) => val !== undefined),
  );
  const wrapper = main({ ...props, "data-root": "" });
  // Read the initial route without subscribing: Router() is typically
  // invoked inside a reactive context (e.g. hydrate(main, App)), and a
  // reactive read here would re-create the whole Router on every
  // navigation. Only the internal derive below subscribes, to pathname
  // and searchParams.
  const route = matchRoute(routerState._oldVal.pathname);
  let _searchParams = routerState._oldVal.searchParams;

  /* istanbul ignore else */
  if (!route) return van.add(wrapper, div("No Route Found"));
  // It's important to READ the params
  Object.assign(routerState.params, route.params);

  // Server-side rendering — single-pass full render in one shot.
  // No reactivity and no shared loading flag: concurrent requests share
  // the routerState singleton, so the client-side loading guard would
  // wrongly bail out with `undefined` on overlapping requests.
  if (isServer) {
    return (async () => {
      try {
        const module = await route.component();
        await executeLifecycle(Object.assign(route, module.route));
        const children = resolveChildren(module);
        return van.add(wrapper, ...children);
      } catch (error) {
        /* istanbul ignore next */
        console.error("Router error:", error);
        /* istanbul ignore next */
        return van.add(wrapper, div("Error loading page"));
      }
    })();
  }

  // Init client here
  initClient();
  let initialized = false;

  // Client-side: hydrate data cache from SSR output
  // This must happen BEFORE any component renders so useRouteData() works.
  // Skip in dev mode for /admin pages: we manually clear dataCache on
  // mutations for instant updates. Public pages reuse SSR data like prod.
  // NOTE: read via _oldVal — subscribing here would re-create the whole
  // Router on every navigation.
  if (
    globalThis.__DATA_CACHE &&
    /* istanbul ignore next -- build-time constant, isDev is false in vitest */
    (!isDev || !routerState._oldVal.pathname.startsWith("/admin"))
  ) {
    dataCache.hydrateFromJSON(globalThis.__DATA_CACHE);
  }

  // Persistent layout chain keys for prefix-diff tracking (client only)
  /** @type {string[]} */
  let layoutKeys = [];
  /** @type {HTMLElement | null} */
  let outlet = null;
  let navToken = 0;
  // Live DOM target for client-side navigations. On the hydration path this
  // starts as the detached wrapper (used for the initial render that hydrate()
  // diffs into the SSR root) and is adopted to the real root once the initial
  // render completes. On the SPA path it stays the wrapper, which is live.
  /** @type {any} */
  let liveTarget = wrapper;

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

    if (keepCount > 0 && keepCount === layoutKeys.length && outlet) {
      // All layouts shared — only the leaf changed.
      // Directly swap the outlet's children; layout DOM is untouched.
      const leafFn = mod.leaf;
      const raw = leafFn ? leafFn() : /* istanbul ignore next */ [];
      /* istanbul ignore else */
      const leafContent = Array.isArray(raw) ? raw.flat() : raw;
      if (Array.isArray(leafContent)) {
        outlet.replaceChildren(...leafContent);
      } else {
        outlet.replaceChildren(leafContent);
      }
    } else {
      // Diverged layout chain — full rebuild with a fresh outlet.
      const div = van.tags.div;
      outlet = div();
      const children = buildChain(mod, outlet);
      liveTarget.replaceChildren(...children);
    }
  };

  // Client-side: check if hydrating SSR content or pure SPA
  const root = document.querySelector("[data-root]");

  if (root) {
    van.derive(() => {
      // Subscribe to pathname AND searchParams: either one triggers a
      // navigation (e.g. search-only changes keep the same pathname).
      // VanJS batches the synchronous writes from setRouterState into a
      // single run, and same-value writes don't re-trigger at all.
      // Everything else is read via _oldVal to avoid extra runs.
      const pathname = routerState.pathname;
      _searchParams = routerState.searchParams;
      if (!initialized) return;
      const matchedRoute = matchRoute(pathname);
      if (!matchedRoute) {
        liveTarget.replaceChildren(div("No Route Found"));
        return;
      }
      (async () => {
        const token = ++navToken;
        routerState._oldVal.loading = true;
        try {
          const module = await matchedRoute.component();
          /* istanbul ignore next */
          if (token !== navToken) return;
          await executeLifecycle(Object.assign(matchedRoute, module.route));
          // A newer navigation may have started during the (possibly slow)
          // lifecycle: never render stale results over fresh ones.
          if (token !== navToken) return;
          /* istanbul ignore else */
          if (document.head) hydrate(document.head, Head());
          if (module.layouts) {
            navigateToModule(module);
          } else {
            layoutKeys = [];
            outlet = null;
            const children = resolveChildren(module);
            liveTarget.replaceChildren(...children);
          }
        } finally {
          routerState._oldVal.loading = false;
        }
      })();
    });
    return async () => {
      const result = await executeModule(route, wrapper, true);
      // Adopt the live SSR root: subsequent navigations mutate the real DOM,
      // not the detached wrapper used for the initial render.
      liveTarget = root;
      initialized = true;
      // Initial hydration is done: freshly rendered client nodes are born
      // into live DOM and need no hydration keys from here on.
      markHydrationComplete();
      return result;
    };
  }

  // Pure SPA path - reactive routing.
  // Subscribed to pathname and searchParams (batched into a single run);
  // everything else goes through _oldVal.
  van.derive(() => {
    _searchParams = routerState.searchParams;
    const matchedRoute = matchRoute(routerState.pathname);
    if (!matchedRoute) {
      wrapper.replaceChildren(div("No Route Found"));
      return;
    }

    (async () => {
      const token = ++navToken;
      // routerState._oldVal.loading = true;
      routerState.loading = true;
      try {
        _searchParams = routerState.searchParams;
        const module = await matchedRoute.component();
        if (token !== navToken) return;
        await executeLifecycle(Object.assign(matchedRoute, module.route));
        // A newer navigation may have started during the (possibly slow)
        // lifecycle: never render stale results over fresh ones.
        if (token !== navToken) return;
        /* istanbul ignore else */
        if (document.head) hydrate(document.head, Head());
        if (module.layouts) {
          navigateToModule(module);
        } else {
          layoutKeys = [];
          outlet = null;
          const children = resolveChildren(module);
          wrapper.replaceChildren(...children);
        }
      } finally {
        // routerState._oldVal.loading = false;
        routerState.loading = false;
      }
    })();
  });

  return wrapper;
};
