import * as CSS from "csstype";
import { State } from "vanjs-core";
import { Primitive } from "./type";
export type VanElement = Element;
export type JSXElementType<P> = (props: P) => VanNode | VanElement;
export type PrimitiveChild = Primitive | State<Primitive>;
export type VanNode = VanElement | PrimitiveChild | VanNode[] | (() => VanNode) | null;
declare const jsx: (jsxTag: string | (() => VanElement), { children, style, ref, ...props }: {
    children?: VanNode | undefined;
    style?: string | CSS.Properties<0 | (string & Record<PropertyKey, unknown>), string & Record<PropertyKey, unknown>> | (() => CSS.Properties) | undefined;
    ref?: State<Element> | undefined;
}) => VanElement;
export default jsx;
