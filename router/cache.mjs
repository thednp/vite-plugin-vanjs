/** @typedef {import("./types").ComponentModule} ComponentModule */
/** @typedef {import("./types").ImportFn} ImportFn */
/** @typedef {typeof import("./types").getCached} GetCachedRoute */
/** @typedef {typeof import("./types").cache} CacheRoute */

/** @type {Map<ImportFn, ComponentModule>} */
const routeCache = new Map();

/** @type {GetCachedRoute} */
export const getCached = (key) => routeCache.get(key);

/** @type {CacheRoute} */
export const cache = (key, value) => {
  routeCache.set(key, value);
};
