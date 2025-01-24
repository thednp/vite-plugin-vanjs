## vite-plugin-vanjs

[![Coverage Status](https://coveralls.io/repos/github/thednp/vite-plugin-vanjs/badge.svg)](https://coveralls.io/github/thednp/vite-plugin-vanjs)
[![ci](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/vite-plugin-vanjs.svg)](https://www.npmjs.com/package/vite-plugin-vanjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-vanjs.svg)](http://npm-stat.com/charts.html?package=vite-plugin-vanjs)
[![typescript version](https://img.shields.io/badge/typescript-5.6.2-brightgreen)](https://www.typescriptlang.org/)
[![vanjs-core version](https://img.shields.io/badge/vanjs--core-1.5.3-brightgreen)](https://github.com/vanjs-org/van)
[![mini-van-plate version](https://img.shields.io/badge/mini--van--plate-0.6.1-brightgreen)](https://github.com/vanjs-org/mini-van-plate)
[![vitest version](https://img.shields.io/badge/vitest-3.0.4-brightgreen)](https://www.vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.0.11-brightgreen)](https://github.com/vitejs)

A mini meta-framework for VanJS developed around the awesome Vite bundler. The plugin comes with a set of modules to simplify your workflow:
* ***@vanjs/router*** - one of the most important part of an application, this one allows you to split code and lazy load components with ease, handles both Client Side Rendering and Server Side Rendering and makes it really easy to work with;
* ***@vanjs/meta*** - allows you to create meta data for your pages as well as add other assets;
* ***@vanjs/jsx*** - enables JSX transformation.


In addition the plugin will automatically load the appropriate Van or VanX objects depending on the client/server environment with zero configuration needed. It uses the `mini-van-plate/shared` module to register the required objects in an isomorphic enviroment.

### Notes 
* The plugin uses `van-ext` along with `mini-van-plate` so you can have everything ready from start. 

* The recommended starter templates for you are the [vite-starter-vanjs-ssr](https://github.com/thednp/vite-starter-vanjs-ssr) and [vite-starter-vanjs-ssr-jsx](https://github.com/thednp/vite-starter-vanjs-ssr-jsx) which already include this plugin.

* In the near future we're going to have a `npm create-vanjs` CLI so stick around!


### Install

1) Install the plugin:

```bash
pnpm add vite-plugin-vanjs
```

```bash
npm install vite-plugin-vanjs
```

```bash
deno add npm:vite-plugin-vanjs
```

2) To add typescript support, edit your `src/vite-env.d.ts` (or any global types you have set in your app) as follows:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-vanjs" />
```


### Usage

Update your `vite.config.mts` file:
```ts
// vite.config.mts
import { defineConfig } from 'vite';
import vanjs from 'vite-plugin-vanjs';

export default defineConfig({
  plugins: [vanjs()],
});
```


**Example**:

While the plugin will resolve the appropriate modules automatically depending on the environment, for your convenience, you can also import the `@vanjs/van` and `@vanjs/vanX` virtual modules, so the plugin makes sure to load the right modules where needed.

```ts
// my-component.ts
import van from '@vanjs/van';

// use van as usual
const MyComponent = () => {
  return van.div("Hello from VanJS!");
};
```
The plugin also exports `vanX`.

```ts
// my-list.ts
import van from '@vanjs/van';
import vanX from '@vanjs/vanX';

type ListItem = { text: string, done: boolean };

// use VanJS as usual
const MyList = () => {
  const items = vanX.reactive<ListItem[]>([]);
  const { div, button, span, a, input, del } = van.tags;
  const inputDom = input({ type: "text", placeholder: "your new item" });
  return div(
    inputDom,
    button({onclick: () => items.push({text: inputDom.value, done: false})}, "Add"),
    vanX.list(div, items, ({val: v}, deleter) => div(
      input({type: "checkbox", checked: () => v.done, onclick: (e) => v.done = e.target.checked}),
      () => (v.done ? del : span)(v.text),
      button({ onclick: deleter }, "Remove"),
    )),
  )
};
```


### JSX Transformation

To enable JSX transformation, you have to edit your `tsconfig.json` as follows:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "@vanjs/jsx"
  }
}
```

**Example**:
```tsx
// App.tsx
import type { ChildDom } from "vanjs-core";
import van from '@vanjs/van';

const App = () => {
  const count = van.state(0);

  return (
    <button onClick={() => count.val++}>{count}</button>
  );
}

van.add(document.getElementById("app") as HTMLElement, <App />);

```

**Notes**:
* in some cases like this one, enforcing a certain typescript type via `as` might be in good order depending on who renders your component;
* you can use `ref` as a `van.state`, `class` instead of `className`, `for` instead of `htmlFor`;
* you can use style as both an object and a string;
* for a JSX starter template, check out the [vite-starter-vanjs-ssr-jsx](https://github.com/thednp/vite-starter-vanjs-ssr-jsx).
* for a pure vanilla starter template, check out the [vite-starter-vanjs-ssr](https://github.com/thednp/vite-starter-vanjs-ssr).



### Credits
* [van-jsx](https://github.com/herudi/van-jsx) a simple Vanilla JSX implementation;
* [vanjs-jsx](https://github.com/vanjs-org/van/tree/main/addons/van_jsx) the official VanJS addon;
* [surplus](https://github.com/adamhaile/surplus/blob/master/index.d.ts) for Typescript definitions also used by SolidJS;
* [inferno](https://github.com/infernojs/inferno/blob/master/packages/inferno/src/core/types.ts) also for typescript definitions.


### License
Released under [MIT](LICENSE).
