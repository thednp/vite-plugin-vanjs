import isServer from "../setup/isServer.mjs";
import van from "vanjs-core";
import { cache, getCached } from "./cache.mjs";

/** @typedef {import('./types').VanNode} VanNode */
/** @typedef {import('./types').DynamicModule} DynamicModule */
/** @typedef {import('./types').ComponentModule} ComponentModule */
/** @typedef {import('./types').ComponentFn} ComponentFn */

/**
 * Registers a lazy component.
 * @type {typeof import("./types").lazy}
 */
export const lazy = (importFn) => {
  if (isServer) {
    return async () => {
      const cached = getCached(importFn);
      /* istanbul ignore next */
      if (cached) {
        return cached;
      }

      const module = await importFn();
      /** @type {ComponentFn} */
      const component = module?.default || module.Page;
      /** @type {ComponentModule} */
      const result = { component, route: module.route };

      cache(importFn, result);
      return result;
    };
  }

  let initialized = false;
  /** @type {import("vanjs-core").State<(ComponentModule["component"] | (() => string))>} */
  const component = van.state(() => "Loading..");
  /** @type {import("vanjs-core").State<ComponentModule["route"]>} */
  const route = van.state({});

  const load = () => {
    if (initialized) return;

    const cached = getCached(importFn);
    /* istanbul ignore next */
    if (cached) {
      component.val = cached.component;
      route.val = cached.route;
      return;
    }

    initialized = true;
    importFn().then(
      /** @param {DynamicModule} module */
      (module) => {
        /** @type {ComponentModule["component"]} */
        const pageComponent = module?.default || module.Page;
        cache(importFn, { component: pageComponent, route: module.route });
        component.val = pageComponent;
        route.val = module.route;
      },
    );
  };

  const lazyComponent = () => {
    load();
    return { component: component.val(), route: route.val };
  };
  lazyComponent.isLazy = true;
  // @ts-expect-error - typescript cannot handle this isomorphically
  return lazyComponent;
};
