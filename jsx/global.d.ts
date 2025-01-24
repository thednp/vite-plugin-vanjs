declare module "@vanjs/jsx" {
  import type { ChildDom, Primitive } from "vanjs-core";
  import type { Element as VanElement } from "mini-van-plate/van-plate";
  export const Fragment = ({ children }: { children?: JSX.Element }) =>
    JSX.Element;
  // export type VanElement = Element;
  export type VanNode =
    | Primitive
    | ChildDom
    | VanElement
    | VanNode[]
    | (() => VanNode)
    | null;

  export function jsx(
    tag: string | ((props: any) => VanNode),
    props: {
      children?: VanNode;
      style?: string | CSSProperties | (() => CSSProperties);
      ref?: State<Element>;
      [key: string]: any;
    },
  ): VanNode;

  export { jsx as createElement, jsx as jsxDEV, jsx as jsxs };
}

declare module "@vanjs/jsx/jsx-runtime" {}
declare module "@vanjs/jsx/jsx-dev-runtime" {}
