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

export interface VanXObject {
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

const vanX: VanXObject = {
  calc,
  reactive,
  noreactive,
  stateFields,
  raw,
  list,
  replace,
  compact,
  get default() {
    return vanX;
  },
};

export { calc, compact, list, noreactive, raw, reactive, replace, stateFields };
export default vanX;
