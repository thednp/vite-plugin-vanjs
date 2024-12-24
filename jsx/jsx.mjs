import van from "@vanjs/van";
import { setAttribute, styleToString } from "./utils.mjs";

export const jsx = (jsxTag, { children, ref, style, ...props }) => {
  if (typeof jsxTag === "string") {
    const ele = van.tags[jsxTag](children);
    
    for (const [k, value] of Object.entries(props)) {
      if (typeof value === "function" && !k.startsWith("on")) {
        van.derive(() => setAttribute(ele, k, value()));
        continue;
      }
      
      if (typeof value === "function" && k.startsWith("on")) {
        ele.addEventListener(k.slice(2).toLowerCase(), value);
        continue;
      }

      if (typeof value === "object" && "val" in value) {
        van.derive(() => setAttribute(ele, k, value.val));
        continue;
      }
      
      setAttribute(ele, k, value);
    }
    if (style) {
      if (typeof style === "function") {
        van.derive(() => ele.style.cssText = styleToString(style()));
      } else {
        ele.style.cssText = styleToString(style);
      }
    }

    if (ref) ref.val = ele;
    return ele;
  }

  return typeof jsxTag === "function" ? jsxTag({ children, ref, style, ...props }) : null;
}