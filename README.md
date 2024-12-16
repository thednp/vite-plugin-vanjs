# vite-plugin-vanjs

[![ci](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/vite-plugin-vanjs.svg)](https://www.npmjs.com/package/vite-plugin-vanjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-vanjs.svg)](http://npm-stat.com/charts.html?package=vite-plugin-vanjs)
[![typescript version](https://img.shields.io/badge/typescript-5.7.2-brightgreen)](https://www.typescriptlang.org/)
[![vanjs-core version](https://img.shields.io/badge/vanjs--core-1.5.2-brightgreen)](https://github.com/vanjs-org/van)
[![mini-van-plate version](https://img.shields.io/badge/mini--van--plate-0.6.1-brightgreen)](https://github.com/vanjs-org/mini-van-plate)
[![vite version](https://img.shields.io/badge/vite-6.0.3-brightgreen)](https://github.com/vitejs)

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