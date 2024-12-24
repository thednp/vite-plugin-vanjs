export const setAttribute = (element, key, value) => {
  if (value == null || value === false || value === "") {
    element.removeAttribute(key);
  } else {
    const attr = value === true ? "" : String(value);
    element.setAttribute(key, attr);
  }
};

export const styleToString = (style) => {
  return typeof style === "string" ? style
    : typeof style === "object" ? Object.entries(style).reduce((acc, key) => acc +
      key[0]
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      key[1] +
      ";", "")
      : "";
};
