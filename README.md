## vite-plugin-vanjs

[![NPM Version](https://img.shields.io/npm/v/vite-plugin-vanjs.svg)](https://www.npmjs.com/package/vite-plugin-vanjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-vanjs.svg)](http://npm-stat.com/charts.html?package=vite-plugin-vanjs)
[![typescript version](https://img.shields.io/badge/typescript-5.6.2-brightgreen)](https://www.typescriptlang.org/)
[![vanjs-core version](https://img.shields.io/badge/vanjs--core-1.5.2-brightgreen)](https://github.com/vanjs-org/van)
[![mini-van-plate version](https://img.shields.io/badge/mini--van--plate-0.6.1-brightgreen)](https://github.com/vanjs-org/mini-van-plate)
[![vite version](https://img.shields.io/badge/vite-6.0.5-brightgreen)](https://github.com/vitejs)

A Vite plugin for VanJS to enable JSX transformation and simplify application development.

This plugin uses and requires the `mini-van-plate` package in order to register the Van and VanX objects in an isomorphic server/client enviroment. If you're planning to do SSR apps, the `van-ext` is also required.

The recommended templates for you to use are the [vite-starter-vanjs-ssr](https://github.com/thednp/vite-starter-vanjs-ssr) and [vite-starter-vanjs-ssr-jsx](https://github.com/thednp/vite-starter-vanjs-ssr-jsx) which already feature this plugin.

If you don't need an SSR/SSG application, you simply make use of the JSX transformation capability.

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

2) To add typescript support, edit your `src/vite-env.d.ts` as follows:

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

For your convenience and for your SSR applications/extensions expecially, you need to import from `@vanjs/van` virtual module, so **vite-plugin-vanjs** makes sure to load the right modules where needed.

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
      input({type: "checkbox", checked: () => v.done, onclick: (e: TodoClickEvent) => v.done = e.target.checked}),
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

van.add(document.getElementById("app")!, <App /> as ChildDom);

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
* [inferno](https://github.com/infernojs/inferno/blob/master/packages/inferno/src/core/types.ts) also typescript definitions.


### License
Released under [MIT](LICENSE).