import type { ChildDom } from "vanjs-core";
import type { JSX } from "./jsx";

export type FragmentProps = {
  children?: JSX.Element;
};

export type Fragment = (props: FragmentProps) => JSX.Element;
