// router/lazy.mjs
import { cacheRoute, getCachedRoute } from "./routeCache.mjs";

/** @typedef {import('./types').VanNode} VanNode */
/** @typedef {import('./types').DynamicModule} DynamicModule */
/** @typedef {import('./types').ComponentModule} ComponentModule */
/** @typedef {import('./types').ComponentFn} ComponentFn */

/**
 * Registers a lazy component.
 * Both server and client return an async function that resolves the module.
 * @type {typeof import("./types").lazy}
 */
export const lazy = (importFn) => {
  const resolveModule = async () => {
    const cached = getCachedRoute(importFn);
    /* istanbul ignore next */
    if (cached) {
      return cached;
    }

    const module = await importFn();
    /** @type {ComponentFn} */
    const component = module?.default || module.Page;
    /** @type {ComponentModule} */
    const result = { component, route: module.route };

    cacheRoute(importFn, result);
    return result;
  };

  resolveModule.isLazy = true;
  return resolveModule;
};
