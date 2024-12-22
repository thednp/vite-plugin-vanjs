// import van from "vanjs-core";
import van from "vite-plugin-vanjs/setup";
import { setAttribute } from "./hyper";

const jsx = (jsxTag, allProps) => {
    const { key, children, ref, ...props } = allProps;

    if (typeof jsxTag === "string") {
        // TODO VanNode to VanElement
        const ele = van.tags[jsxTag](children);
        for (const [k, value] of Object.entries(props ?? {})) {
            // Auto Update Attribute
            if (typeof value === "function" && !k.startsWith("on")) {
                van.derive(() => {
                    const attr = value();
                    setAttribute(ele, k, attr);
                });
                continue;
            }
            // Add Event Listener
            if (typeof value === "function" && k.startsWith("on")) {
                ele.addEventListener(k.replace("on", "").toLowerCase(), value);
                continue;
            }

            // Handle reactive attributes
            if (typeof value === "object" && "val" in value) {
                van.derive(() => {
                  setAttribute(ele, k, value.val);
                });
                continue;
            }
            
            setAttribute(ele, k, value);
            continue;
        }
        if (key != null) {
            setAttribute(ele, 'data-key', String(key));
        }
        if (ref != null) {
            ref.val = ele;
        }
        return ele;
    }
    if (typeof jsxTag === "function") {
        return jsxTag(allProps);
    }
    return null;
};
export default jsx;
