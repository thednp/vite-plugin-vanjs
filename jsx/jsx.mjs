import van from "@vanjs/van";
import setup from "@vanjs/van";
import { setAttribute, styleToString } from "./utils.mjs";

export const jsx = (jsxTag, { children, ref, style, ...props }) => {
  if (typeof jsxTag === "string") {
    const newElement = van.tags[jsxTag](props, children);

    // on server it's good enough to return here
    if (setup.isServer) return newElement;

    // on the client, we sure do need to set the attributes
    for (const [k, value] of Object.entries(props)) {
      if (typeof value === "function" && !k.startsWith("on")) {
        van.derive(() => setAttribute(newElement, k, value()));
        continue;
      }

      if (typeof value === "function" && k.startsWith("on")) {
        newElement.addEventListener(k.slice(2).toLowerCase(), value);
        continue;
      }

      if (typeof value === "object" && "val" in value) {
        van.derive(() => setAttribute(newElement, k, value.val));
        continue;
      }

      setAttribute(newElement, k, value);
    }
    if (style) {
      if (typeof style === "function") {
        van.derive(() => newElement.style.cssText = styleToString(style()));
      } else {
        newElement.style.cssText = styleToString(style);
      }
    }

    if (ref) ref.val = newElement;
    return newElement;
  }

  return typeof jsxTag === "function"
    ? jsxTag({ children, ref, style, ...props })
    : null;
};
