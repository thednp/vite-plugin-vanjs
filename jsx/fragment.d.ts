import type { JSX } from "./jsx.d.ts";

export type FragmentProps = {
  children?: JSX.Element;
};

export type Fragment = (props: FragmentProps) => JSX.Element;
