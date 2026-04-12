# AGENTS.md - vite-plugin-vanjs

## Commands

### Package Manager
```bash
pnpm install          # Install dependencies
```

### Testing
```bash
pnpm test             # Run all tests (vitest)
pnpm test -- <file>   # Run a single test file (e.g., pnpm test -- client.test.ts)
pnpm test -t <name>   # Run tests matching a name pattern
pnpm test-ui          # Run tests with Vitest UI
```

### Linting & Formatting
```bash
pnpm lint             # Run TypeScript check + Deno lint
pnpm lint:ts          # Run Deno lint only
pnpm fix:ts           # Run Deno lint with auto-fix
pnpm format           # Format code with Deno formatter
pnpm check:ts         # TypeScript type checking (tsc --noEmit)
```

### CI Pipeline (in order)
1. `pnpm format` - ensure formatting
2. `pnpm lint` - typecheck + eslint
3. `pnpm test` - run tests with coverage

## Project Structure

```
plugin/       # Main Vite plugin (index.mjs, helpers.mjs, types.d.ts)
router/       # @vanjs/router - file-system routing, lazy loading
meta/         # @vanjs/meta - head metadata management
setup/        # @vanjs/setup - isomorphic VanJS module loading
client/       # @vanjs/client - client-side rendering tools
server/       # @vanjs/server - SSR tools
jsx/          # @vanjs/jsx - JSX transformation
tests/        # Test files (*.test.ts, *.test.tsx)
experiments/  # Excluded from builds
```

## Code Style

### File Extensions
- `.mjs` for JavaScript ES modules (all source code)
- `.d.ts` for TypeScript type definitions
- `.ts` / `.tsx` for test files only

### Imports
- Use relative imports with explicit `.mjs` extension: `import { foo } from "./bar.mjs"`
- Use `@vanjs/*` aliases for internal modules in user-facing code
- Use `node:` prefix for Node.js built-ins: `import { join } from "node:path"`
- Barrel exports via `export * from "./module.mjs"` in index files

### Types
- JSDoc type annotations in `.mjs` files: `/** @type {SomeType} */`
- Parameter types: `/** @param {string} name */`
- Type definitions in separate `.d.ts` files per module
- Strict TypeScript: `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- Use `// @ts-expect-error` with comment for intentional type errors

### Naming Conventions
- **PascalCase**: Exported components/functions (`Router`, `Route`, `Head`, `VitePluginVanJS`)
- **camelCase**: Internal functions, variables, file names (`matchRoute.mjs`, `extractParams.mjs`)
- **kebab-case**: Not used in this codebase

### Formatting (Deno)
- 2-space indentation
- Double quotes for strings
- Semicolons required
- Trailing commas in multi-line structures
- Run `pnpm format` before committing

### Error Handling
- Use try/catch for async operations with `console.error` logging
- Graceful degradation: return safe defaults instead of crashing
- Use `/* istanbul ignore next */` for unreachable error branches

### Testing (Vitest)
- Environment comment at top: `// @vitest-environment happy-dom`
- Use `describe` / `test` / `beforeEach` from vitest
- Chai-style assertions: `expect(val).to.equal()`, `expect(val).toBeDefined()`
- Test files: `tests/*.test.ts` and `tests/*.test.tsx`
- Use `await new Promise(res => setTimeout(res, 17))` for async DOM updates
- Coverage provider: Istanbul

### Coverage Pragmas
- `/* istanbul ignore next */` - skip next statement
- `/* istanbul ignore next - reason */` - with explanation
- `/* istanbul ignore else */` - skip else branch
- `/* istanbul ignore if */` - skip if branch
- `// istanbul ignore next - reason` - inline comment form

### Git
- No commit hooks configured
- CI triggers on changes to: plugin/, jsx/, router/, meta/, server/, client/, tests/, package.json
