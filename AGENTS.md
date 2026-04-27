# AGENTS.md

## Project Overview

**vite-plugin-vanjs** is a mini meta-framework for [VanJS](https://vanjs.org/) powered by Vite. It provides file-system routing, SSR/SSG, JSX support, metadata management, and a data caching layer — all as a Vite plugin.

## Architecture

| Directory | Package export | Purpose |
|-----------|---------------|---------|
| `plugin/` | `vite-plugin-vanjs` | Core Vite plugin — route scanning, virtual modules, build/dev config |
| `router/` | `@vanjs/router` | Router, Route, lazy, A, navigate, routerState, dataCache, matchRoute, extractParams |
| `client/` | `@vanjs/client` | Hydration — `hydrate()` for SSR-to-client DOM reconciliation |
| `server/` | `@vanjs/server` | `renderToString()`, preload link generation, data cache serialization |
| `meta/` | `@vanjs/meta` | Head/Title/Meta/Link — SSR-safe document metadata |
| `setup/` | `@vanjs/setup` | User setup file resolution |
| `jsx/` | `@vanjs/jsx` | JSX runtime (jsx, jsxs, jsxDev) |

## Key Concepts

- **ESM only** — all source files are `.mjs`, types are `.d.ts`
- **Isomorphic** — same router code runs on server and client; `isServer` (from `setup/isServer.mjs`) gates SSR vs SPA paths
- **Reactive state** — `microStore()` (in `router/state.mjs`) creates reactive proxy objects using `van.state()` under the hood
- **Async-first lazy()** — both server and client return `async () => ComponentModule` with `.isLazy = true`
- **Data flow** — `route.load()` returns data → cached by `executeLifecycle()` in `dataCache` → read via `useRouteData()`
- **Cache key** — `""` for empty params, `JSON.stringify(params)` otherwise
- **No `DynamicModule`** — replaced by `LazyComponent = Promise<{ default?, Page?, route? }>`

## Commands

```sh
pnpm test          # Run vitest (watch mode)
pnpm test -- --run # Run vitest once
pnpm lint          # deno lint + tsc -noEmit
pnpm format        # deno fmt
pnpm check:ts      # tsc -noEmit only
```

## Testing

- **Framework**: Vitest 4 with `@vitest/browser` and `happy-dom`
- **Environments**: `client.test.ts` uses `happy-dom`, `server.test.ts` uses `@vitest-environment node`
- **Config**: `vitest.config.ts` — routes dir is `tests/routes`
- **Coverage**: Istanbul, enabled by default, covers `plugin/`, `router/`, `setup/`, `client/`, `server/`, `meta/`, `jsx/`
- **Test files**: `tests/client.test.ts`, `tests/client.test.tsx`, `tests/server.test.ts`, `tests/server.test.tsx`

## Code Style

- **No comments** unless explicitly requested
- **No semicolons** at line ends (deno fmt default)
- **JSDoc** on public APIs only — `@typedef` references `./types.d.ts`
- **Formatting**: `deno fmt` handles all formatting — don't fight it
- **Linting**: `deno lint` — fix with `pnpm fix:ts`

## Type Definitions

- `router/global.d.ts` — module declaration for `@vanjs/router` (augments `"@vanjs/router"`)
- `router/types.d.ts` — standalone type exports (references `global.d.ts`)
- Each package directory has its own `types.d.ts`
- **Keep them in sync** — when changing exports, update both `global.d.ts` and `types.d.ts`

## Common Pitfalls

- `microStore()` skips proxying for empty plain objects (`{}`) — they're assigned directly, so `Object.assign` on `routerState.params` works but changes aren't reactive
- `lazy()` is **not** synchronous on the client anymore — always `await route.component()`
