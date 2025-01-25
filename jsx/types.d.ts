/// <reference path="global.d.ts" />
import type { Fragment } from "./fragment";

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

export type { JSX } from "./jsx";
export { Fragment, jsx, jsx as jsxDEV, jsx as jsxs };
