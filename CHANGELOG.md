# Changelog

## [0.1.25] - 2026-06-13

### Meta

- **`removeMeta()`** — new function to remove meta tags by id or `TAGNAME.id` selector.
- **`Meta` type** — now includes `property` attribute.
- **`id` attribute priority** — moved to front of attribute list for `getTagAttribute()`.

### Router

- **`routerState.status` → `routerState.loading`** — simplified to a boolean (`true` during navigation, `false` otherwise). Removed `"idle" | "pending" | "success" | "error"` enum.
- **`preload(params)` / `load(params)`** — lifecycle hooks now receive route params as argument.
- **`aria-current`** — returns `""` instead of `null` for non-matching links.
- **`isCurrentLocation()`** — now accounts for searchParams when checking partial path matches.

### Plugin

- **`generateRouteProloaders()`** — passes `params` to `preload`/`load` lifecycle hooks in generated route proloaders.
- **Plugin return type** — simplified from `Plugin` to `Plugin<VanJSPluginOptions>`.

### Client

- **`elementsMatch()` text node filtering** — filters out empty text nodes before comparing child node lists, fixing SSR/client mismatch where SSR omits empty text nodes.
- **`hydrate()`** — now always returns `target` element.
- **100% branch coverage** — client/index.mjs now has 100% statement, branch, function, and line coverage.

### Server

- **`helpers.mjs` refactor** — `updateHead()` and `executeModule()` moved from `router.mjs` to `helpers.mjs`. `executeModule` now wraps work in `try/finally` to guarantee `loading = false` is always reset.

### Testing

- **Coverage improvements** — added tests for `removeMeta`, empty text node handling in hydration, and `elementsMatch` with text node children.

### Dependencies

- Updated `@types/node` to `^25.9.3`, `vite` to `^8.0.16`, `vitest` to `^4.1.8`, `happy-dom` to `^20.10.3`.

## [0.1.17] - 2026-04-27

### Router

#### Breaking

- **`lazy()` is now async-first on both server and client.** Previously, the client returned a synchronous function with `van.state` for component/route, showing a "Loading.." placeholder. Now both server and client return the same `async () => ComponentModule` pattern with `.isLazy = true`. This unifies the API and eliminates the client-only "Loading.." state.
- **`executeLifecycle()` signature changed.** Now takes `(route, params)` directly instead of `({ route }, params)`. The `route` argument accepts a `RouteEntry`, a `{ preload, load }` object, or `null`.
- **`miniStore()` renamed to `microStore()`.** Same behavior, new name. Empty plain objects (like `params: {}`) are now assigned directly instead of being skipped.
- **`getHref()` renamed to `getValue()`.** Returns the string value of a `State` or primitive. Works with reactive `href` values passed to `A()`.
- **`cache.mjs` replaced by `routeCache.mjs`.** Exports renamed from `cache`/`getCached` to `cacheRoute`/`getCachedRoute`.
- **Removed `DynamicModule` type.** Replaced by `LazyComponent` which uses `Promise<{ default?, Page?, route? }>`.

#### Added

- **`routerState.status`** — reactive status field: `"idle" | "pending" | "success" | "error"`. Set automatically during lifecycle execution. Initialized to `"success"` on server and during SSR hydration, `"idle"` for pure SPA.
- **`dataCache` module** — path-keyed data cache with LRU eviction. Exported as `* as dataCache` from `@vanjs/router`. Supports `get`, `set`, `has`, `del`, `clear`, `touch`, `toJSON`, `hydrateFromJSON`, `size`, `setMaxRoutes`. Data from `route.load()` return values is automatically cached.
- **`useRouteData()`** — convenience hook that returns the current route's cached data from `dataCache`.
- **`isCurrentLocation()`** — checks if the current pathname includes the given path segment (for nav highlighting of parent sections).
- **`isLazyComponent()`** — now checks both `.isLazy === true` and `AsyncFunction` constructor name, regardless of server/client context.
- **`extractParams()`** — now exported from `@vanjs/router` for extracting route params from a pattern and path.
- **`getValue()`** — replacement for `getHref()`. Extracts the raw string value from a `State` or primitive.
- **`DataStatus` and `CacheEntry` types** added to type definitions.

#### Changed

- **`A()` component** — now uses `getValue(href)` to support reactive href values. Added `isCurrentLocation` check for `aria-current` (returns `"page"` for exact match, `"location"` for partial match, `null` otherwise). Prefetching via `onmouseenter` now guards against duplicate preloads with a `preloaded` state.
- **`Router()`** — hydration path now returns `async () => {}` so `hydrate()` can properly await the resolved content. SPA path uses `van.derive` with async module resolution. SSR path passes `module.route` to `executeLifecycle()` instead of the entire module.
- **`Route()`** — now preserves `preload`/`load` on the `RouteEntry` even for lazy components (previously only attached them for non-lazy wrappers).
- **`hydrate()`** — now handles `Promise` content recursively (re-calls `hydrate` when resolved). Added support for function content via `van.derive()`. Skips DOM replacement when `outerHTML` matches. Always returns `target`.

#### Fixed

- **`isCurrentPage()` / `isCurrentLocation()`** — were referencing removed `getHref` function, causing `ReferenceError` at runtime. Now use `getValue()`.
- **`pluginDefaults` mutation** — `Object.assign(pluginDefaults, options)` was mutating the shared defaults object across test runs. Now uses spread: `{ ...pluginDefaults, ...options }`.
- **`routerState.params` not updating** — `microStore` now handles empty plain objects by assigning them directly, so `Object.assign(routerState.params, params)` works correctly.

### Plugin

- **`generateRouteProloaders()`** — `load` lifecycle now returns the data value (`return _data`) so it can be captured by `executeLifecycle` and stored in `dataCache`.
- **`VitePluginVanJS` return type** — simplified from `Plugin<VanJSPluginOptions>` to `Plugin`.
- **SSR config** — added `noExternal` comment for `virtual:@vanjs/routes`.

### Server

- **`renderToString()`** — now properly handles async function sources and Promise values through recursive resolution.

### Types

- **`router/global.d.ts`** — fully rewritten to match implementation. Added `status` to `RouterState`, added `getValue`, `isCurrentPage`, `isCurrentLocation`, `isLazyComponent`, `useRouteData`, `microStore`, `dataCache`, `CacheEntry`, `DataStatus`, `RouteConfig`, `extractParams` exports. Removed `DynamicModule`.
- **`router/types.d.ts`** — synced with `global.d.ts`. Added all new exports and types. Removed stale `resolveRouteLifecycle` (never implemented).
- **`server/global.d.ts`** — updated `renderToString` to accept wider input types.
