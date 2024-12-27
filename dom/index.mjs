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
    ? Object.entries(style).reduce((acc, key) =>
      acc +
      key[0]
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      key[1] +
      ";", "")
    : "";
};

/**
 * @param {Element} root the root element
 * @param {Element | Element[]} content the element(s) to hydrate
 */
export const hydrateRoot = (root, content) => {
  root.replaceChildren(
    ...(Array.isArray(content) ? content : [content]),
  );
  return root;
};
