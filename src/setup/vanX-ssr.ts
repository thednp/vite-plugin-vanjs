import { dummyVanX, registerEnv, type VanXObj } from "mini-van-plate/shared";

export interface VanXPlate extends VanXObj {
  readonly default: VanXPlate;
}

const {
  calc,
  compact,
  list,
  noreactive,
  raw,
  reactive,
  replace,
  stateFields,
} = dummyVanX;

const vanX: VanXPlate = {
  calc,
  compact,
  list,
  noreactive,
  raw,
  reactive,
  replace,
  stateFields,
  get default() {
    return vanX;
  },
} as VanXPlate;

registerEnv({ vanX });

export { calc, compact, list, noreactive, raw, reactive, replace, stateFields };
export default vanX;
