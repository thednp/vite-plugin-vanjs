import type { MaybeChildNode } from "../types/types.d.ts";

/**
 * Merge the children of an Element or an array of elements with an optional array of children
 * into the childen prperty of a simple object.
 * @param source
 * @param children
 */
export const unwrap = (
  source: unknown,
  ...children: MaybeChildNode[]
): { children: MaybeChildNode[] } => {
  const pageChildren =
    source && typeof source === "object" && "children" in source &&
      Array.isArray((source as { children: unknown }).children)
      ? (source as { children: MaybeChildNode[] }).children
      : typeof source === "function"
      ? [
        ...(source as () => { children?: MaybeChildNode[] })()?.children ||
          (source as () => MaybeChildNode[])(),
      ]
      : typeof HTMLElement !== "undefined" && source instanceof HTMLElement
      ? [...source.children] as MaybeChildNode[]
      : Array.isArray(source)
      ? source as MaybeChildNode[]
      : [source as MaybeChildNode];

  return {
    children: [
      ...children,
      ...pageChildren,
    ],
  };
};
