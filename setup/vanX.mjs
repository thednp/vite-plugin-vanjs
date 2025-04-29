// setup/vanX.mjs
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

// Create the namespace object first
const vanX = {
  calc,
  reactive,
  noreactive,
  stateFields,
  raw,
  list,
  replace,
  compact,
};

// Export named exports
export { calc, compact, list, noreactive, raw, reactive, replace, stateFields };

// Export as default
export { vanX as default };
export {};
