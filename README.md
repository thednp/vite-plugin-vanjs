# vite-plugin-vanjs

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

## Usage

```ts
// vite.config.mts
import { defineConfig } from 'vite';
import vanjs from 'vite-plugin-vanjs';

export default defineConfig({
  plugins: [vanjs()],
});
```

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
// my-component.ts
import van from '@vanjs/van';
import vanX from '@vanjs/vanX';

// use van as usual
const MyList = () => {
  const items = vanX.reactive([]);
  const { div, button, span, a, input, del } = van.tags;
  const inputDom = input({ type: "text", placeholder: "your new item" })
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

```tsx
// App.tsx
import type{ ChildDom } from "vanjs-core";
import van from '@vanjs/van';

const App = () => {
  const count = van.state(0);

  return (
    <button onClick={() => count.val++}>{count}</button>
  );
}

van.add(document.getElementById("app")!, <App /> as ChildDom);

```
To enable JSX transformation, you have to follow these two steps:

1) Edit your `tsconfig.json` as follows:

```json
{
  "compilerOptions": {
    // {... your other compiler options }
    "jsx": "preserve",
    "jsxImportSource": "@vanjs/jsx"
  },}
```

2) Edit your `src/vite-env.d.ts` as follows:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-vanjs" />
```


### License
Released under [MIT](LICENSE).