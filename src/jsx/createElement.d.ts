import * as CSS from "csstype";
import { State } from "vanjs-core";
import { Primitive } from "./type";
export type VanElement = Element;
export type JSXElementType<P> = (props: P) => VanNode | VanElement;
export type PrimitiveChild = Primitive | State<Primitive>;
export type VanNode = VanElement | PrimitiveChild | VanNode[] | (() => VanNode) | null;
declare const createElement: (jsxTag: string | (() => JSXElementType<unknown>), { children, style, ref, ...props }: {
    children?: VanNode | undefined;
    // style?: CSS.Properties<0 | (string & {}), string & {}> | (() => CSS.Properties) | undefined;
    style?: string | CSS.Properties | State<string | CSS.Properties> | undefined;
    ref?: State<Element> | undefined;
}) => JSXElementType<unknown>;
export default createElement;
