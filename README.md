## vite-plugin-vanjs

[![Coverage Status](https://coveralls.io/repos/github/thednp/vite-plugin-vanjs/badge.svg)](https://coveralls.io/github/thednp/vite-plugin-vanjs)
[![ci](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml/badge.svg)](https://github.com/thednp/vite-plugin-vanjs/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/vite-plugin-vanjs.svg)](https://www.npmjs.com/package/vite-plugin-vanjs)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-vanjs.svg)](http://npm-stat.com/charts.html?package=vite-plugin-vanjs)
[![typescript version](https://img.shields.io/badge/typescript-5.6.2-brightgreen)](https://www.typescriptlang.org/)
[![vanjs-core version](https://img.shields.io/badge/vanjs--core-1.5.3-brightgreen)](https://github.com/vanjs-org/van)
[![mini-van-plate version](https://img.shields.io/badge/mini--van--plate-0.6.3-brightgreen)](https://github.com/vanjs-org/mini-van-plate)
[![vitest version](https://img.shields.io/badge/vitest-3.1.2-brightgreen)](https://www.vitest.dev/)
[![vite version](https://img.shields.io/badge/vite-6.3.3-brightgreen)](https://vite.dev)

A mini meta-framework for [VanJS](https://vanjs.org/) developed around the awesome [vite](https://vite.dev) and tested with [vitest](https://vitest.dev). The plugin comes with a set of modules to streamline your workflow:
* ***@vanjs/router*** - one of the most important part of an application which allows you to split code and lazy load page like components with ease, handles both Client Side Rendering (SSR) and Server Side Rendering (CSR) and makes it really easy to work with;
* ***@vanjs/meta*** - allows you to create metadata for your pages as well as load additional assets with ease;
* ***@vanjs/jsx*** - enables JSX transformation;
* ***@vanjs/setup*** - enables loading VanJS modules isomorphically;
* ***@vanjs/server*** - provides various tools for Server Side Rendering (SSR);
* ***@vanjs/client*** - provides various tools for Client Side Rendering (CSR).

The plugin will automatically load the appropriate Van or VanX objects depending on the client/server environment with zero configuration needed. It uses the `mini-van-plate/shared` module to register the required objects on the server.

Also in _development_ mode, the plugin will load the `van.debug.js` module to help you better troubleshoot your VanJS application.


### Notes 
* The plugin uses `van-ext` along with `mini-van-plate` so you can have everything ready from the start.
* Kickstart your VanJS project with `npm create vanjs@latest`. Some starter templates feature this plugin and most essential tools.


### Install
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

### Wiki

For a complete guide on how to use the plugin, be sure to check the wiki:
* [Quick Start](https://github.com/thednp/vite-plugin-vanjs/wiki/Quick-Start): the right place to get started;
* [Routing](https://github.com/thednp/vite-plugin-vanjs/wiki/Routing): a complete guide on how to configure routing;
* [Metadata](https://github.com/thednp/vite-plugin-vanjs/wiki/Metadata): the quick guide to help you manage your app meta tags;
* [JSX](https://github.com/thednp/vite-plugin-vanjs/wiki/JSX): a complete guide on how to use JSX transformation;
* [Isomorphic](https://github.com/thednp/vite-plugin-vanjs/wiki/Isomorphic): a quick guide on isomorphism in VanJS;
* [About](https://github.com/thednp/vite-plugin-vanjs/wiki/About): some note on the project.


### Credits
* [van-jsx](https://github.com/herudi/van-jsx) a simple Vanilla JSX implementation;
* [vanjs-jsx](https://github.com/vanjs-org/van/tree/main/addons/van_jsx) the official VanJS addon;
* [surplus](https://github.com/adamhaile/surplus/blob/master/index.d.ts) for Typescript definitions also used by SolidJS;
* [inferno](https://github.com/infernojs/inferno/blob/master/packages/inferno/src/core/types.ts) also for typescript definitions.


### License
Released under [MIT](LICENSE).
