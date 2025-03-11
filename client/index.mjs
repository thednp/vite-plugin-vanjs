import { unwrap } from "../router/index.mjs";

/**
 * @param {Element} element
 * @param {string} key
 * @param {boolean | string | number | null | undefined} value
 */
export const setAttribute = (element, key, value) => {
  if (value == null || value === false || value === "" || value === undefined) {
    element.removeAttribute(key);
  } else {
    const attr = value === true ? "" : String(value);
    element.setAttribute(key, attr);
  }
};

/**
 * @param {import("csstype").Properties | string} style
 * @returns {string}
 */
export const styleToString = (style) => {
  return typeof style === "string"
    ? style
    : typeof style === "object"
    ? Object.entries(style).reduce((acc, [key, value]) =>
      acc +
      key
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      // allow state values in style object
      (typeof value === "object" && "val" in value ? value.val : value) +
      ";", "")
    : /* istanbul ignore next */ "";
};

/**
 * @param {Element} target the root element
 * @param {Element | Element[] | Promise<Element | Element[]>} content the element(s) to hydrate
 */
export const hydrate = (target, content) => {
  if (content instanceof Promise) {
    content.then((res) => {
      const wrapper = unwrap(res);
      target.replaceChildren(
        ...(Array.from(wrapper.children)),
      );
    });
    return target;
  }

  const wrapper = unwrap(content);
  target.replaceChildren(
    ...(Array.from(wrapper.children)),
  );
  return target;
};
