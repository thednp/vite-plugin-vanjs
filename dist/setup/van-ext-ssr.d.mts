/*!
* vite-plugin-vanjs VanX SSR v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import * as _$mini_van_plate_shared0 from "mini-van-plate/shared";
import { VanXObj } from "mini-van-plate/shared";

//#region src/setup/vanX-ssr.d.ts
interface VanXPlate extends VanXObj {
  readonly default: VanXPlate;
}
declare const calc: <R>(f: () => R) => R, compact: <T extends object>(obj: T) => T, list: <T extends object>(container: any, items: T, itemFunc: (v: _$mini_van_plate_shared0.State<_$mini_van_plate_shared0.ValueType<T>>, deleter: () => void, k: _$mini_van_plate_shared0.KeyType<T>) => any) => any, noreactive: <T extends object>(obj: T) => T, raw: <T extends object>(obj: T) => T, reactive: <T extends object>(obj: T) => T, replace: <T extends object>(obj: T, replacement: _$mini_van_plate_shared0.ReplacementFunc<T> | T) => T, stateFields: <T extends object>(obj: T) => _$mini_van_plate_shared0.StateOf<T>;
declare const vanX: VanXPlate;
//#endregion
export { VanXPlate, calc, compact, vanX as default, list, noreactive, raw, reactive, replace, stateFields };
//# sourceMappingURL=van-ext-ssr.d.mts.map