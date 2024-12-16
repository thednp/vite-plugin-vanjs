# vite-plugin-vanjs

A Vite plugin for VanJS to simplify SSR and SSG application development.

This plugin provides a virtual `vanjs/ssr` import that resolves to the correct Van object for either server or client environments.

## Usage

```ts
// vite.config.mts
import { defineConfig } from 'vite';
import vanjs from 'vite-plugin-vanjs';

export default defineConfig({
  plugins: [vanjs()],
});
```

```ts
// my-component.ts
import van from 'vanjs/ssr';

// use van as usual
const MyComponent = () => {
  return van.div("Hello from VanJS!");
};
```


### Typescript

Create a `global.d.ts` file in the root of your project:
```ts
// global.d.ts
/// <reference types="vite/client" />

declare module "vanjs/ssr" {
    import van from "vanjs-core";
    export default van;
}
```

Update your `tsconfig.json` file:
```json
{
  // "compilerOptions": { ... },
  "include": ["global.d.ts"], /* link the file here*/
}
```


### License
Released under [MIT](LICENSE).