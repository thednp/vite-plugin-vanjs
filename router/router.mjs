import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { MODE } from "../plugin/const.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./matchRoute.mjs";
import { executeModule } from "./helpers.mjs";
import { initializeHeadTags } from "../meta/index.mjs";
import * as dataCache from "./dataCache.mjs";
import "virtual:@vanjs/routes";

const isDev = MODE === "development";

/** @typedef {import("./types.d.ts").ComponentModule} ComponentModule */
/** @typedef {import("./types.d.ts").RouteEntry} RouteEntry */
/** @typedef {import("./types.d.ts").VanNode} VanNode */

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

  // Server-side rendering
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

  // Client-side: check if hydrating SSR content or pure SPA
  const root = document.querySelector("[data-root]");

  if (root) {
    van.derive(() => {
      if (!initialized) return;
      const matchedRoute = matchRoute(routerState.pathname);
      if (!matchedRoute) {
        wrapper.replaceChildren(div("No Route Found"));
        return;
      }
      (async () => {
        _searchParams = routerState.searchParams;
        await executeModule(matchedRoute, wrapper);
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
      _searchParams = routerState.searchParams;
      await executeModule(matchedRoute, wrapper);
    })();
  });

  return wrapper;
};
