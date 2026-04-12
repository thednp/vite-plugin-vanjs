/*!
* vite-plugin-vanjs Van v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import * as _$vanjs_core0 from "vanjs-core";
import van from "vanjs-core";

//#region src/setup/van.d.ts
declare const vanClient: {
  tags: typeof van.tags;
  state: {
    <T>(): _$vanjs_core0.State<T>;
    <T>(initVal: T): _$vanjs_core0.State<T>;
  };
  derive: <T>(f: () => T) => _$vanjs_core0.State<T>;
  add: (dom: Element | DocumentFragment, ...children: readonly _$vanjs_core0.ChildDom[]) => Element;
  hydrate: <T extends Node>(dom: T, f: (dom: T) => T | null | undefined) => T;
};
//#endregion
export { vanClient as default };
//# sourceMappingURL=van.d.mts.map