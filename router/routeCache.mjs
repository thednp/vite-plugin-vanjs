/** @typedef {import("./types").ComponentModule} ComponentModule */
/** @typedef {import("./types").ImportFn} ImportFn */
/** @typedef {typeof import("./types").getCachedRoute} GetCachedRoute */
/** @typedef {typeof import("./types").cacheRoute} CacheRoute */

/** @type {Map<ImportFn, ComponentModule>} */
const routeCache = new Map();

/** @type {GetCachedRoute} */
export const getCachedRoute = (key) => routeCache.get(key);

/** @type {CacheRoute} */
export const cacheRoute = (key, value) => {
  routeCache.set(key, value);
};
