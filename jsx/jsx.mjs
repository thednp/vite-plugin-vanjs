import van from "../setup/van.mjs";
import setup from "../setup/index.mjs";
import { setAttribute, styleToString } from "../client/index.mjs";

export const jsx = (jsxTag, { children, ref, style, ...props }) => {
  if (typeof jsxTag === "string") {
    const newElement = van.tags[jsxTag](props, children);

    van.derive(() => {
      /* istanbul ignore else */
      if (style) {
        const styleProp = typeof style === "function" ? style() : style;
        const styleValue = styleToString(styleProp);

        if (setup.isServer) {
          newElement.propsStr += ` style="${styleValue}"`;
        } else {
          newElement.style.cssText = styleValue;
        }
      }
    });

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

    if (ref) ref.val = { current: newElement };

    return newElement;
  }

  return typeof jsxTag === "function"
    ? jsxTag({ children, ref, style, ...props })
    : /* istanbul ignore next */ null;
};
