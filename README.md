## vite-plugin-vanjs

[![Coverage Status](https://coveralls.io/repos/github/thednp/vite-plugin-vanjs/badge.svg)](https://coveralls.io/github/thednp/vite-plugin-vanjs)
[![ci](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/vite-plugin-vanjs.svg)](https://www.npmjs.com/package/vite-plugin-vanjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-vanjs.svg)](http://npm-stat.com/charts.html?package=vite-plugin-vanjs)
[![typescript version](https://img.shields.io/badge/typescript-5.6.2-brightgreen)](https://www.typescriptlang.org/)
[![vanjs-core version](https://img.shields.io/badge/vanjs--core-1.5.3-brightgreen)](https://github.com/vanjs-org/van)
[![mini-van-plate version](https://img.shields.io/badge/mini--van--plate-0.6.3-brightgreen)](https://github.com/vanjs-org/mini-van-plate)
[![vitest version](https://img.shields.io/badge/vitest-3.1.1-brightgreen)](https://www.vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.2.5-brightgreen)](https://vite.dev)

A mini meta-framework for [VanJS](https://vanjs.org/) developed around the awesome [Vite](https://vite.dev). The plugin comes with a set of modules to simplify your workflow:
* ***@vanjs/router*** - one of the most important part of an application which allows you to split code and lazy load page like components with ease, handles both Client Side Rendering (SSR) and Server Side Rendering (CSR) and makes it really easy to work with;
* ***@vanjs/meta*** - allows you to create metadata for your pages as well as load additional assets with ease;
* ***@vanjs/jsx*** - enables JSX transformation;
* ***@vanjs/setup*** - enables loading VanJS modules isomorphically;
* ***@vanjs/server*** - provides various tools for Server Side Rendering;
* ***@vanjs/client*** - provides various tools for Client Side Rendering.

The plugin will automatically load the appropriate Van or VanX objects depending on the client/server environment with zero configuration needed. It uses the `mini-van-plate/shared` module to register the required objects in an isomorphic enviroment.

Also in _development_ mode, the plugin will load the `van.debug.js` module to help you better troubleshoot your VanJS application.


### Notes 
* The plugin uses `van-ext` along with `mini-van-plate` so you can have everything ready from the start.

* Kickstart your VanJS project with `npm create vanjs@latest`. Some starter templates feature this plugin and most essential tools.


### Install

1) Install the plugin:

```bash
npm install vite-plugin-vanjs@latest
```

```bash
pnpm add vite-plugin-vanjs@latest
```

```bash
deno add npm:vite-plugin-vanjs@latest
```

```bash
bun add vite-plugin-vanjs@latest
```


2) To add Typescript support, edit your `src/vite-env.d.ts` (or any global types you have set in your app) as follows:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-plugin-vanjs" />
```


### Usage

Update your `vite.config.ts` file:
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
  return van.tags.div("Hello from VanJS!");
};
```
Using `vanX` in your code:

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
**Note**: Anywhere you have **vite-plugin-vanjs** enabled in your Vite apps, all imports from `"vanjs-core"` or `"vanjs-ext"` will be replaced with `"@vanjs/van"` and `"@vanjs/vanX"` respectivelly. In addition you have the `isServer` getter in the `@vanjs/setup` module, something you can use to exclude code execution in server/client environment.


### Router
The **vite-plugin-vanjs** plugin provides a router with load and preload capability, code splitting and lazy loading, all via the exported `@vanjs/router` module. This functionality is still in early stages, but it manages to work with both Server Side Rendering (SSR) when using an appropriate starter template, as well as Client Side Rendering (CSR/SPA - your classic VanJS app), as we'll see in the example below.

Here's a basic example, let's start with the `app.ts`:

```ts
// src/app.ts
import van from "vanjs-core";
import { Router, Route } from "@vanjs/router";

// define routes
Route({ path: '/', component: () => van.tags.div('Hello VanJS') });
Route({ path: '/about', component: lazy(() => import('./pages/about'))});
Route({ path: '*', component: () => van.tags.div('404 - Page Not Found') });

function App() {
  // the Router is only an outlet
  return Router();
}

// render the app
van.add(document.body, App());
```
**IMPORTANT** - using lazy components for the main route (`"/"`) is not allowed. This is to prevent hydration waterfalls, especially for SSR apps.


Here's how a page should look like, pay attention to the comments:
```ts
// src/pages/about.ts
import van from "vanjs-core";
import { A, navigate } from "@vanjs/router";

// define routes
export const route = {
  preload: async () => {
    // in most cases you may want to enforce user access control
    console.log('About preload triggered');
  },
  load: async () => {
    // Load data if needed
    // you might want to cache this data
    console.log('About load triggered');
  }
}

// you must export your page component as either
// a named export "Page" or a default export
export function Page() {
  const { div, h1, p, button } = van.tags;
  return div(
    h1('About'),
    p('This is the about page'),
    A({ href: "/" }, "Back to Home"),
    button({ onclick: () => navigate('/about-details') }, "Learn more..")
  )
}
```
**Notes**
- when hovering the `A` component, if it links to a lazy component it will trigger that page component preload, but not preload any data;
- if you use the regular `a` from `van.tags` instead of the `A` component, your application will work just like a classic Multi-Page App (MPA);
- the `navigate` tool is used by the `A` component and you can also use it to navigate to different routes, something you can use with your API/logic.


### Metadata
The **vite-plugin-vanjs** plugin provides metadata management via the exported `@vanjs/meta` module. This module works with both SSR and CSR, and makes it easy to work with.

Depending on the type of application, it's generally very easy to setup the system to work properly, we only need to make sure that we execute functions in a specific order:

* first we define a set of default tags to be used by both client and server (if using an SSR template) on all pages that don't come with any metadata tags;
* next, on other pages, we define tags that override both the existing and the default tags.

Here's a quick example, first let's start again with the `app.ts`:
```ts
import van from 'vanjs-core'
import { Style, Title, Link, Meta } from '@vanjs/meta'

function App() {
  const { div, h1, p } van.tags;

  // a good practice is to define some default tags
  // they are used on pages where no tags are set
  Title("VanJS + Vite App");
  Meta({ name: "description", content: "Sample app description" });
  Meta({ property: "og:description", content: "Some open graph description for your app" });
  Link({ href: 'path-to/your-style.css', rel: "stylesheet" });
  Script({ src: 'path-to/your-script.js' });
  Style({ id: "app-style" },
    `p { margin-bottom: 1rem }`
  );

  return div(
    h1('Hello VanJS!'),
    p('Sample paragraph.')
  );
}

// render or hydrate the app
van.add(document.body, App());
```
**Note**
- the `Style` component doesn't have any unique attribute so we must use a unique ID to prevent duplicates;
- all provided metadata components don't return any markup, their function is to register new tags or update existing ones.


### JSX Transformation
To enable JSX transformation, you don't need to do anything except to add Typescript support if you need to. So edit your `tsconfig.json` as follows:

```json
{
  "compilerOptions": {
    /** other compilerOptions */
    "jsx": "preserve",
    "jsxImportSource": "@vanjs/jsx"
  }
}
```

**Example**:
```tsx
// App.tsx
import van from '@vanjs/van';

const App = () => {
  const count = van.state(0);
  const btnRef = van.state<{ current: HTMLElement }>();

  return (
    <button ref={btnRef} onClick={() => count.val++}>{count}</button>
  );
}

const root = document.getElementById("app") as HTMLElement;

van.add(root, <App /> as HTMLElement);
```

**Notes**:
* in cases like this one, enforcing a certain typescript type via `as` might be in good order depending on who renders your component;
* you can use `ref` as a `van.state`, `class` attribute instead of `className`, `for` attribute instead of `htmlFor`;
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
