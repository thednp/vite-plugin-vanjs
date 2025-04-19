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
vanX.default = vanX;

export default vanX;
