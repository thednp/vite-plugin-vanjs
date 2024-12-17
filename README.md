# vite-plugin-vanjs

[![ci](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/vite-plugin-vanjs.svg)](https://www.npmjs.com/package/vite-plugin-vanjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-vanjs.svg)](http://npm-stat.com/charts.html?package=vite-plugin-vanjs)
[![typescript version](https://img.shields.io/badge/typescript-5.7.2-brightgreen)](https://www.typescriptlang.org/)
[![vanjs-core version](https://img.shields.io/badge/vanjs--core-1.5.2-brightgreen)](https://github.com/vanjs-org/van)
[![mini-van-plate version](https://img.shields.io/badge/mini--van--plate-0.6.1-brightgreen)](https://github.com/vanjs-org/mini-van-plate)
[![vite version](https://img.shields.io/badge/vite-6.0.3-brightgreen)](https://github.com/vitejs)

A Vite plugin for VanJS to simplify enable JSX transformation and SSR and SSG application development.

This plugin uses and requires the `mini-van-plate` package in order to register the Van and VanX objects in an isomorphic server/client enviroment. If you're planning to do SSR apps, the `van-ext` is also required.

The recommended template for you to use is the [vite-starter-vanjs-ssr](https://github.com/thednp/vite-starter-vanjs-ssr) which already features this plugin.

If you don't need an SSR/SSG, you simply make use of the JSX transformation capability.

## Usage

```ts
// vite.config.mts
import { defineConfig } from 'vite';
import vanjs from 'vite-plugin-vanjs';

export default defineConfig({
  plugins: [vanjs(
    jsx: false,
  )],
});
```

For SSR applications, you need to import the shared `env` object, vite-plugin-vanjs makes sure to load it where needed.
```ts
// my-component.ts
import { env } from 'mini-van-plate/shared';

// use van as usual
const MyComponent = () => {
  return env.van.div("Hello from VanJS!");
};
```


### JSX Transformation

```tsx
// App.tsx
import { env } from 'mini-van-shared';

const { van } = env;

const App = () => {
  const count = env.van.state(0);

  return (
    <button onClick={() => count++}>{count.val}</button>
  );
}

van.add(document.getElementById("app")!, <App />);

```



### License
Released under [MIT](LICENSE).