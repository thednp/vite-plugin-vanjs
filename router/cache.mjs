/** @typedef {import("./types").ComponentModule} ComponentModule */
/** @typedef {typeof import("./types").getCached} GetCachedRoute */
/** @typedef {typeof import("./types").cache} CacheRoute */

/** @type {Map<string, ComponentModule>} */
const routeCache = new Map();

/** @type {GetCachedRoute} */
export const getCached = (key) => routeCache.get(key);

/** @type {CacheRoute} */
export const cache = (key, value) => {
  routeCache.set(key, value);
};
