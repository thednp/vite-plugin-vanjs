# vite-plugin-vanjs

A Vite plugin for VanJS to simplify SSR and SSG application development.

This plugin provides a virtual `vanjs/ssr` import that resolves to the correct Van object for either server or client environments.

## Usage

```typescript
// vite.config.mts
import { defineConfig } from 'vite';
import vanjs from 'vite-plugin-vanjs';

export default defineConfig({
  plugins: [vanjs()],
});
```

```typescript
// my-component.ts
import van from 'vanjs/ssr';

// use van as usual
const MyComponent = () => {
  return van.div("Hello from VanJS!");
};
```

### License
Released under [MIT](LICENSE).