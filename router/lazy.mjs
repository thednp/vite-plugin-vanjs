import setup from "@vanjs/setup";
import van from "vanjs-core";
import { cache, getCached } from "./cache";

/** @typedef {import('./types').VanNode} VanNode */
/** @typedef {import('./types').ComponentModule} ComponentModule */

/**
 * Registers a lazy component.
 * @param {Promise<VanNode>} importFn
 * @returns {ComponentModule | Promise<ComponentModule>}
 */
export const lazy = (importFn) => {
  if (setup.isServer) {
    return async () => {
      const cached = getCached(importFn);
      /* istanbul ignore next */
      if (cached) {
        return cached;
      }
      const module = await importFn();
      const component = module.Page || module.default;
      const result = { component, route: module.route };

      cache(importFn, result);
      return result;
    };
  }

  let initialized = false;
  const component = van.state(() => "");
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
    importFn().then((module) => {
      const comp = module.Page || module.default;
      cache(importFn, { component: comp, route: module.route });
      component.val = comp;
      route.val = module.route;
    });
  };

  const lazyComponent = () => {
    load();
    return { component: component.val(), route: route.val };
  };
  lazyComponent.isLazy = true;
  return lazyComponent;
};
