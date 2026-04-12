import type { ElementUnion, DOMElementsMap } from "../types/dom-types.d.ts";

declare global {
  export namespace JSX {
    type Element = ElementUnion;
    type Fragment = (props: { children: JSX.Element }) => JSX.Element;
    interface IntrinsicElements extends DOMElementsMap {}
  }
}

// export type { Fragment } from "./jsx.ts";
// export type Fragment = (props: { children: JSX.Element }) => JSX.Element;
export type Fragment = JSX.Fragment;
