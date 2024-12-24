declare module '@vanjs/jsx' {
  import type { ChildDom, Primitive } from "vanjs-core";
  export const Fragment = ({children}: {children?: JSX.Element}) => JSX.Element;
  export type VanElement = Element;
  export type VanNode = Primitive | ChildDom | VanElement | VanNode[] | (() => VanNode) | null;

  export function jsx(
    tag: string | ((props: any) => VanNode),
    props: {
      children?: VanNode;
      style?: string | CSSProperties | (() => CSSProperties);
      ref?: State<Element>;
      [key: string]: any;
    }
  ): VanNode;

  export { jsx as jsxDEV, jsx as jsxs, jsx as createElement };
}

declare module '@vanjs/jsx/jsx-runtime' {}
declare module '@vanjs/jsx/jsx-dev-runtime' {}
