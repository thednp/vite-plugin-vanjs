/** @typedef {{ data: unknown; error: Error | null; status: "idle" | "pending" | "success" | "error"; timestamp: number }} CacheEntry */
/** @typedef {CacheEntry["status"]} DataStatus */

/**
 * @param {string} pathname
 * @returns {string}
 */
export const normalizePath = (pathname) => {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

/** @type {Map<string, Map<string, CacheEntry>>} */
const dataCacheMap = new Map();

const DEFAULT_MAX_ROUTES = 20;
let maxRoutes = DEFAULT_MAX_ROUTES;

/**
 * @param {number} n
 */
export const setMaxRoutes = (n) => {
  maxRoutes = n;
};

const evictIfNeeded = () => {
  if (maxRoutes <= 0) return;
  while (dataCacheMap.size > maxRoutes) {
    const firstKey = dataCacheMap.keys().next().value;
    if (firstKey !== undefined) {
      dataCacheMap.delete(firstKey);
    }
  }
};

/**
 * @param {string} pathname
 * @param {string} key
 * @returns {CacheEntry | undefined}
 */
export const get = (pathname, key) => {
  const path = normalizePath(pathname);
  const routeMap = dataCacheMap.get(path);
  if (!routeMap) return undefined;
  return routeMap.get(key);
};

/**
 * @param {string} pathname
 * @param {string} key
 * @param {Partial<CacheEntry>} entry
 */
export const set = (pathname, key, entry) => {
  const path = normalizePath(pathname);
  let routeMap = dataCacheMap.get(path);
  if (!routeMap) {
    routeMap = new Map();
    dataCacheMap.set(path, routeMap);
    evictIfNeeded();
  }
  routeMap.set(key, {
    ...entry,
    timestamp: entry?.timestamp || Date.now(),
  });
};

/**
 * @param {string} pathname
 * @param {string} [key]
 * @returns {boolean}
 */
export const has = (pathname, key) => {
  const path = normalizePath(pathname);
  const routeMap = dataCacheMap.get(path);
  if (!routeMap) return false;
  if (key === undefined) return routeMap.size > 0;
  return routeMap.has(key);
};

/**
 * @param {string} pathname
 * @returns {Record<string, CacheEntry> | undefined}
 */
export const getRoute = (pathname) => {
  const path = normalizePath(pathname);
  const routeMap = dataCacheMap.get(path);
  if (!routeMap) return undefined;
  return Object.fromEntries(routeMap.entries());
};

/**
 * @param {string} pathname
 * @param {string} [key]
 * @returns {boolean}
 */
export const del = (pathname, key) => {
  const path = normalizePath(pathname);
  if (key === undefined) {
    const deleted = dataCacheMap.delete(path);
    return deleted;
  }
  const routeMap = dataCacheMap.get(path);
  if (!routeMap) return false;
  const deleted = routeMap.delete(key);
  if (routeMap.size === 0) {
    dataCacheMap.delete(path);
  }
  return deleted;
};

export const clear = () => {
  dataCacheMap.clear();
};

/**
 * @param {string} pathname
 */
export const touch = (pathname) => {
  const path = normalizePath(pathname);
  const routeMap = dataCacheMap.get(path);
  if (!routeMap) return;
  dataCacheMap.delete(path);
  dataCacheMap.set(path, routeMap);
};

/**
 * @returns {Record<string, Record<string, { data: unknown; status: string; timestamp: number; error: { message: string } | null }>>}
 */
export const toJSON = () => {
  /** @type {Record<string, Record<string, { data: unknown; status: string; timestamp: number; error: { message: string } | null }>>} */
  const result = {};
  for (const [path, routeMap] of dataCacheMap.entries()) {
    result[path] = {};
    for (const [key, entry] of routeMap.entries()) {
      result[path][key] = {
        data: entry.data,
        timestamp: entry.timestamp,
        error: entry.error ? { message: entry.error.message } : null,
      };
    }
  }
  return result;
};

/**
 * @param {Record<string, Record<string, { data: unknown; status?: string; timestamp?: number; error?: { message: string } | null }>>} json
 */
export const hydrateFromJSON = (json) => {
  if (!json || typeof json !== "object") return;
  for (const [path, routeEntries] of Object.entries(json)) {
    const normalized = normalizePath(path);
    let routeMap = dataCacheMap.get(normalized);
    if (!routeMap) {
      routeMap = new Map();
      dataCacheMap.set(normalized, routeMap);
    }
    for (const [key, entry] of Object.entries(routeEntries)) {
      routeMap.set(key, {
        data: entry.data,
        timestamp: entry.timestamp || Date.now(),
        error: entry.error ? new Error(entry.error.message) : null,
      });
    }
  }
};

/** @returns {number} */
export const size = () => dataCacheMap.size;
