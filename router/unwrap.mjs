/** @typedef {typeof import("./types.d.ts").unwrap} Unwrap */
/** @typedef {import("./types.d.ts").VanNode} VanNode */

/**
 * Merge the children of an Element or an array of elements with an optional array of children
 * into the childen prperty of a simple object.
 * @type {Unwrap}
 */
export const unwrap = (source, ...children) => {
  const layout = () => {
    /** @type {VanNode[]} */
    const pageChildren =
      source && typeof source === "object" && "children" in source &&
        Array.isArray(source?.children)
        ? source.children
        : typeof source === "function"
        // @ts-expect-error - this case is specific to VanJS components in SSR
        ? [...source()?.children || source()]
        : typeof HTMLElement !== "undefined" && source instanceof HTMLElement
        ? [...source.children]
        : /* istanbul ignore next */ Array.isArray(source)
        ? source
        : [source];

    return {
      children: [
        ...(children || /* istanbul ignore next */ []),
        ...pageChildren,
      ],
    };
  };
  return layout();
};
