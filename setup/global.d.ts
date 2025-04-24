declare module "@vanjs/van" {
  import type { Van } from "vanjs-core";
  const van: Van;
  export default van;
}

declare module "@vanjs/vanX" {
  import type {
    CalcFunction,
    CompactFunction,
    ListFunction,
    NoreactiveFunction,
    RawFunction,
    ReactiveFunction,
    ReplaceFunction,
    StateFieldsFunction,
  } from "vanjs-ext";
  import type { VanXObj } from "mini-van-plate/shared";

  export const calc: CalcFunction;
  export const compact: CompactFunction;
  export const list: ListFunction;
  export const noreactive: NoreactiveFunction;
  export const raw: RawFunction;
  export const reactive: ReactiveFunction;
  export const replace: ReplaceFunction;
  export const stateFields: StateFieldsFunction;

  // Define the vanX object type
  interface VanXObject {
    calc: CalcFunction;
    reactive: ReactiveFunction;
    noreactive: NoreactiveFunction;
    stateFields: StateFieldsFunction;
    raw: RawFunction;
    list: ListFunction;
    replace: ReplaceFunction;
    compact: CompactFunction;
    readonly default: VanXObject;
  }
  interface VanXPlate extends VanXObj {
    readonly default: VanXObj;
  }

  const vanX: VanXObject | VanXPlate;
  export default vanX;
}

declare module "@vanjs/setup" {
  import van from "@vanjs/van";
  import vanX from "@vanjs/vanX";

  const isServer: boolean;
  export { isServer, van, vanX };
}
