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
  // Define default as part of the initial object
  get default() {
    return vanX;
  },
};

// Export named exports
export { calc, compact, list, noreactive, raw, reactive, replace, stateFields };

// Export as default
export default vanX;
