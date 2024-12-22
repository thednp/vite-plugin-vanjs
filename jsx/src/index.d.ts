import type { ChildDom } from "vanjs-core";
export type Fragment = ({children}: {children?: ChildDom | undefined}) => ChildDom;
export { default as createElement, default as jsx, default as jsxDEV, } from "./jsx";
export * from "./type";
