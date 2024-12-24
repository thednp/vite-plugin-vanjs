declare module "@vanjs/van" {
  import type { Van } from "vanjs-core";
  const van: Van;
  export default van;
}

declare module "@vanjs/vanX" {
  import * as VanX from "vanjs-ext";
  const vanX: typeof VanX;
  export default vanX;
}

declare module "@vanjs/setup" {
  import type { Van } from "vanjs-core";
  import * as VanX from "vanjs-ext";

  interface Setup {
    isServer: boolean;
    van: Van;
    vanX: typeof VanX;
  }
  const setup: Setup;
  export default setup;
}
