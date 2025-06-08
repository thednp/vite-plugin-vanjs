import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { setAttributeNS, styleToString } from "../client/index.mjs";
import { namespaceElements } from "./namespaceElements.mjs";

let currentNamespace;

/**
 * Compiles JSX to VanJS elements with automatic namespace resolution.
 *
 * @param {string|Function} jsxTag - The tag name (e.g., 'svg') or component function.
 * @param {Object} props - Props including children, ref, style, and attributes.
 * @returns {Element|null} The compiled VanJS element or null for invalid tags.
 */
export const jsx = (jsxTag, { children, ref, style, ...rest }) => {
  // Filter props with undefined values
  const props = Object.fromEntries(
    Object.entries(rest).filter(([_, val]) => val !== undefined),
  );

  if (typeof jsxTag === "string") {
    const ns = currentNamespace || namespaceElements[jsxTag];
    const newElement = (ns ? van.tags(ns) : van.tags)[jsxTag](props, children);

    // Handle style reactively
    van.derive(() => {
      if (style) {
        const styleProp = typeof style === "function" ? style() : style;
        const styleValue = styleToString(styleProp);
        if (isServer) {
          newElement.propsStr += ` style="${styleValue}"`;
        } else {
          newElement.style.cssText = styleValue;
        }
      }
    });

    // On server, apply props as string
    if (isServer) {
      return newElement;
    }

    // On client, apply attributes reactively
    for (const [k, value] of Object.entries(props)) {
      // Use element's namespace for attributes
      const attrNamespace = k === "xmlns" ? null : newElement.namespaceURI;

      if (typeof value === "function" && !k.startsWith("on")) {
        van.derive(() => setAttributeNS(attrNamespace, newElement, k, value()));
        continue;
      }

      if (typeof value === "function" && k.startsWith("on")) {
        newElement.addEventListener(k.slice(2).toLowerCase(), value);
        continue;
      }

      if (typeof value === "object" && "val" in value) {
        van.derive(() =>
          setAttributeNS(attrNamespace, newElement, k, value.val)
        );
        continue;
      }

      setAttributeNS(attrNamespace, newElement, k, value);
    }

    if (ref) ref.val = { current: newElement };

    return newElement;
  }

  return typeof jsxTag === "function"
    ? jsxTag({ children, ref, style, ...props })
    : /* istanbul ignore next */ null;
};
