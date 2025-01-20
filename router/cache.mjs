/** @typedef {import("./types").ComponentModule} ComponentModule */
/** @typedef {import("./types").GetCachedRoute} GetCachedRoute */
/** @typedef {import("./types").CacheRoute} CacheRoute */

/** @type {Map<string, ComponentModule>} */
const routeCache = new Map();

/** @type {GetCachedRoute} */
export const getCached = (key) => routeCache.get(key);

/** @type {CacheRoute} */
export const cache = (key, value) => {
  routeCache.set(key, value);
};
