# Changelog

## [0.2.0] - 2026-09-15

### Plugin

- **Windows path fix** — `fileToRoute()` now normalizes backslashes to forward slashes, preventing `PARSE_ERROR` from OXC parser when route paths contain Windows separators.
- **Layout resolution fix** — `findLayouts()` now normalizes all `path.join()` output with `normalizePath()`, fixing layout detection and import paths on Windows.

### Router

- **Layout chain rendering** — plugin now generates `{ route, component, layouts, leaf }` for routes with layouts. Client router builds layout chains inside-out (leaf → innermost layout → outermost layout) with prefix-diff detection to reuse shared layouts across sibling pages.
- **`RouteLayout` type** — new type for `{ path, component }` layout entries in the generated route modules.
- **`routerState._oldVal` non-reactive reads** — `microStore()` now exposes `_oldVal` getters backed by `rawVal`, which never create reactive subscriptions (`van.state().rawVal` stays in sync with `.val` on `vanjs-core`, with a `.val` fallback on `mini-van-plate`). Everything except navigation signals is read through it.
- **Single Router instance with `hydrate(main, App)`** — `Router()` setup reads (`pathname`, `searchParams`) are non-reactive, so the template pattern of passing `App` as a function no longer re-creates the whole Router (and its derive, layout state and outlet) on every navigation. Fixes layout DOM being rebuilt and lifecycle executions accumulating by one per navigation.
- **Search-aware routing** — client derives (hydration and SPA) now subscribe to both `pathname` and `searchParams`, so same-path query changes (search input, pagination) trigger navigation. VanJS batches the synchronous writes from `setRouterState()` into a single run and ignores same-value writes, so each navigation still executes its lifecycle exactly once.
- **Stale navigation guard** — the `navToken` is re-checked after `executeLifecycle()`, before any DOM mutation, on both client paths. A slow load from a superseded navigation (e.g. rapid search typing) resolves but never renders over fresh results.
- **Live-target hydration** — after the initial render, client navigations mutate the adopted SSR root instead of the detached render wrapper. Shared layouts swap only the outlet's children, preserving layout DOM and component state; `outlet` is cleared when leaving layout routes.
- **Server one-shot render** — the server branch inlines resolve → lifecycle → render with no shared `loading` flag. Overlapping SSR requests share the `routerState` singleton, so the client-side loading guard could wrongly bail out with `undefined` ("Render error! Source not recognized").
- **`lazy()` component resolution** — also resolves `module.component` (layout-chain modules), not just `default`/`Page`.

### Testing

- **100% coverage** — 880/880 statements, 500/500 branches, 162/162 functions, 829/829 lines. New suites: template-pattern hydration (single Router instance, layout DOM preservation, array leaves), search-only navigations with overlapping slow/fast loads on hydration and SPA paths, concurrent SSR renders. Hydration tests now assert on the live DOM like real templates do.

### Dependencies

- Updated `vanjs-core` to `^1.6.1`, `@types/node` to `^26.5.1`, `@vitest/browser` to `^5.0.1`, `@vitest/coverage-istanbul` to `^5.0.1`, `@vitest/ui` to `^5.0.1`, `happy-dom` to `^20.14.5`, `typescript` to `7.0.2`, `vite` to `^8.3.0`, `vitest` to `^5.0.1`.

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
