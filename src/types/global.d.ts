declare module "virtual:@vanjs/routes" {}

declare module "@vanjs/van" {
  import type { Van } from "vanjs-core";
  const van: Van;
  export default van;
}

declare module "@vanjs/vanX" {
  import {
    calc,
    compact,
    list,
    noreactive,
    raw,
    reactive,
    replace,
    stateFields,
  } from "vanjs-ext";
  import type { VanXObj } from "mini-van-plate/shared";

  // Define the vanX object type
  interface VanXObject {
    calc: typeof calc;
    reactive: typeof reactive;
    noreactive: typeof noreactive;
    stateFields: typeof stateFields;
    raw: typeof raw;
    list: typeof list;
    replace: typeof replace;
    compact: typeof compact;
    readonly default: VanXObject;
  }
  interface VanXPlate extends VanXObj {
    readonly default: VanXObj;
  }

  const vanX: VanXObject | VanXPlate;
  export default vanX;
}

declare module "@vanjs/server" {
  export type * from "vite-plugin-vanjs/server";
  export * from "vite-plugin-vanjs/server";
}

declare module "@vanjs/router" {
  export type * from "vite-plugin-vanjs/router";
  export * from "vite-plugin-vanjs/router";
}

declare module "@vanjs/meta" {
  export type * from "vite-plugin-vanjs/meta";
  export * from "vite-plugin-vanjs/meta";
}

declare module "@vanjs/jsx" {
  export type * from "vite-plugin-vanjs";
  export * from "vite-plugin-vanjs/jsx-runtime";
}

declare module "@vanjs/jsx/jsx-runtime" {
  export type * from "vite-plugin-vanjs/jsx-runtime";
  export * from "vite-plugin-vanjs/jsx-runtime";
}
declare module "@vanjs/jsx/jsx-dev-runtime" {
  export type * from "vite-plugin-vanjs/jsx-dev-runtime";
  export * from "vite-plugin-vanjs/jsx-dev-runtime";
}

declare module "@vanjs/client" {
  export * from "vite-plugin-vanjs/client";
  export type * from "vite-plugin-vanjs/client";
}
