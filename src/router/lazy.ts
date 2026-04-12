import van from "@vanjs/van";
import { isServer } from "../setup/isServer.ts";
import { cache, getCached } from "./cache.ts";
import type { ComponentModule, DynamicModule, ImportFn } from "./types.d.ts";

/**
 * Registers a lazy component.
 * @param importFn
 */
export function lazy(importFn: ImportFn): () => Promise<ComponentModule> {
  if (isServer) {
    return async () => {
      const cached = getCached(importFn);
      if (cached) {
        return cached;
      }

      const module = await importFn() as DynamicModule;
      const component = module?.default ?? module.Page ?? (() => null);
      const result: ComponentModule = { component, route: module.route };

      cache(importFn, result);
      return result;
    };
  }

  let initialized = false;
  const component = van.state<() => unknown>(() => "Loading..");
  const route = van.state<Record<string, unknown>>({});

  const load = () => {
    if (initialized) return;

    const cached = getCached(importFn);
    if (cached) {
      component.val = cached.component;
      route.val = cached.route ?? {};
      return;
    }

    initialized = true;
    importFn().then((mod) => {
      const module = mod as DynamicModule;
      const pageComponent = module?.default ?? module.Page ?? (() => null);
      cache(importFn, { component: pageComponent, route: module.route });
      component.val = pageComponent;
      route.val = module.route ?? {};
    });
  };

  const lazyComponent = () => {
    load();
    return { component: component.val(), route: route.val };
  };
  (lazyComponent as unknown as Record<string, unknown>).isLazy = true;
  return lazyComponent as unknown as () => Promise<ComponentModule>;
}
