/// <reference path="global.d.ts" />
import type { JSX } from "./jsx.d.ts";
import type { Fragment } from "./fragment.d.ts";

declare function jsx(
  type: any,
  props: any
): () =>
  | (Node & {
      [key: string]: any;
    })
  | (Node & {
      [key: string]: any;
    })[];

export { jsx, jsx as jsxs, jsx as jsxDEV, Fragment };
