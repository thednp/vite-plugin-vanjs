import type { ComponentModule, ImportFn } from "./types.d.ts";

const routeCache = new Map<ImportFn, ComponentModule>();

/**
 * Return a route cache.
 * @param key the cache route key
 */
export function getCached(key: ImportFn): ComponentModule | undefined {
  return routeCache.get(key);
}

/**
 * Cache a route.
 * @param key the cache route key
 * @param value the cache route
 */
export function cache(key: ImportFn, value: ComponentModule): void {
  routeCache.set(key, value);
}
