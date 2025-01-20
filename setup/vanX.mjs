import setup from "./index.mjs";
const vanX = setup.vanX;

export const {
  calc,
  reactive,
  noreactive,
  stateFields,
  raw,
  list,
  replace,
  compact,
} = "default" in vanX ? vanX.default : vanX;
export default vanX;
