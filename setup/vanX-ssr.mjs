import { dummyVanX, registerEnv } from "mini-van-plate/shared";

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

const vanX = {
  calc,
  compact,
  list,
  noreactive,
  raw,
  reactive,
  replace,
  stateFields,
};

registerEnv({ vanX });

export { calc, compact, list, noreactive, raw, reactive, replace, stateFields };

export { vanX as default };
export {};
