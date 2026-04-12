/*!
* vite-plugin-vanjs VanX v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { calc, compact, list, noreactive, raw, reactive, replace, stateFields } from "vanjs-ext";

//#region src/setup/vanX.d.ts
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
declare const vanX: VanXObject;
//#endregion
export { VanXObject, calc, compact, vanX as default, list, noreactive, raw, reactive, replace, stateFields };
//# sourceMappingURL=van-ext.d.mts.map