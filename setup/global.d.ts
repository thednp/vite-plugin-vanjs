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
  const vanX: {
    calc: typeof calc;
    reactive: typeof reactive;
    noreactive: typeof noreactive;
    stateFields: typeof stateFields;
    raw: typeof raw;
    list: typeof list;
    replace: typeof replace;
    compact: typeof compact;
  };
  export default vanX;
  export {
    calc,
    compact,
    list,
    noreactive,
    raw,
    reactive,
    replace,
    stateFields,
  };
}

declare module "virtual:@vanjs/hydration" {
}
declare module "@vanjs/setup" {
  import type { Van } from "vanjs-core";
  import type * as vanX from "vanjs-ext";
  import type { dummyVanX } from "mini-van-plate/shared";

  interface Setup {
    isServer: boolean;
    van: Van;
    vanX: typeof vanX | typeof dummyVanX;
  }
  const setup: Setup;
  export default setup;
}
