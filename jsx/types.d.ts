/// <reference path="global.d.ts" />
import type { Fragment } from "./fragment.d.ts";

declare function jsx(
  type: unknown,
  props: unknown,
): () =>
  | (Node & {
    [key: string]: unknown;
  })
  | (Node & {
    [key: string]: unknown;
  })[];

export type { JSX } from "./jsx.d.ts";
export { Fragment, jsx, jsx as jsxDEV, jsx as jsxs };
