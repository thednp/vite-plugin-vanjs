---
name: vite-plugin-vanjs
description: Vite plugin for VanJS providing SSR, file-system routing, hydration, JSX transformation, metadata management, and isomorphic module loading
license: MIT
metadata:
  audience: developers
  workflow: frontend
---

## Overview

**vite-plugin-vanjs** is a comprehensive Vite plugin for [VanJS](https://vanjs.org/) applications. It provides a full-stack development experience with SSR support, file-system routing, advanced hydration, JSX transformation, and metadata management.

## Project Structure

```
plugin/       # Main Vite plugin (index.mjs, helpers.mjs, types.d.ts)
router/       # @vanjs/router - file-system routing, lazy loading
meta/         # @vanjs/meta - head metadata management
setup/        # @vanjs/setup - isomorphic VanJS module loading
client/       # @vanjs/client - client-side rendering and hydration tools
server/       # @vanjs/server - SSR rendering tools
jsx/          # @vanjs/jsx - JSX transformation
tests/        # Test files (*.test.ts, *.test.tsx)
```

## Module Aliases

- `@vanjs/van` - replaces `vanjs-core` imports (isomorphic)
- `@vanjs/vanX` - replaces `vanjs-ext` imports (isomorphic)
- `@vanjs/router` - routing and navigation
- `@vanjs/meta` - head metadata management
- `@vanjs/setup` - isomorphic setup utilities
- `@vanjs/client` - client-side hydration tools
- `@vanjs/server` - SSR rendering tools
- `@vanjs/jsx` - JSX transformation

## Key Features

### File-System Routing (`@vanjs/router`)

- Automatic route generation from `src/routes/` directory
- Supports dynamic routes (`[id].ts`), catch-all (`[...all].ts`), grouped routes (`(root)/`), and layouts
- Route lifecycle: `preload` (runs before render) and `load` (runs during render)
- Lazy loading via `lazy(() => import('./page'))`
- `Router()` component - main outlet, initializes head metadata before route matching
- `A()` component - client-side navigation anchor
- `navigate(path, { replace })` - programmatic navigation
- `routerState` - reactive state with `pathname`, `searchParams`, `params`

### Hydration (`@vanjs/client`)

- Two-phase hydration: initial (diff-based) and subsequent (direct replacement)
- `data-hk` attribute marks interactive elements (auto-added by proxy)
- `data-h` attribute marks hydrated targets
- `hydrate(target, content)` - hydrates server-rendered DOM with client components
- Head tags are initialized before any route lifecycle execution
- Styles/scripts should be imported via page/component imports, not managed through head tags

### Metadata (`@vanjs/meta`)

- `Title()`, `Meta()` components
- Works with both SSR and CSR
- Page-level tags override app-level defaults
- Components register tags, they don't return markup

### Isomorphism (`@vanjs/setup`)

- `isServer` - environment detection
- Automatically loads correct VanJS modules for server/client
- Proxies wrap `mini-van-plate` (server) and `vanjs-core` (client)

### JSX (`@vanjs/jsx`)

- Enabled by default, minimal runtime compilation
- Use `class` (not `className`), `for` (not `htmlFor`)
- `jsxImportSource: "@vanjs/jsx"` in tsconfig
- Supports SVG, MathML, fragments, refs via `van.state`

## Code Conventions

- Source files: `.mjs` extension, ES modules
- Type definitions: `.d.ts` files
- Test files: `.ts` / `.tsx`
- JSDoc types in `.mjs` files, TypeScript in `.d.ts`
- PascalCase exports, camelCase internals
- 2-space indentation, double quotes, semicolons (Deno formatting)
- Relative imports with explicit `.mjs`: `import { foo } from "./bar.mjs"`

## Commands

```bash
pnpm install          # Install dependencies
pnpm test             # Run tests (vitest)
pnpm lint             # TypeScript check + Deno lint
pnpm format           # Format with Deno formatter
pnpm check:ts         # TypeScript type checking
```

## Router Architecture

The Router component has three rendering paths:

1. **SSR** (isServer): async component loading, lifecycle execution, returns HTML string
2. **Hydration** (root exists from SSR): sync component loading, lifecycle execution, head update
3. **SPA** (no root): reactive `van.derive` with `replaceChildren` for route changes

Head initialization (`initializeHeadTags()`) runs before any route matching or lifecycle execution on the client.
