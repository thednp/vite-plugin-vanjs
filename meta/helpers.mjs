import setup from "@vanjs/setup";

/** @type {import('./types.d.ts').ParseAttributes} */
export const parseAttributes = (attributeString) => {
  /** @type {Record<string, string>} */
  const attributes = {};
  const attributeRegex = /([a-zA-Z0-9_-]+)(?:="([^"]*?)")?/g;
  let match;

  while ((match = attributeRegex.exec(attributeString)) !== null) {
    const name = match[1];
    const value = match[2] || /* istanbul ignore next */ "";
    attributes[name] = value;
  }

  return attributes;
};

/** @type {typeof import('./types.d.ts').getTagAttribute} */
const getTagAttribute = (tag) => {
  const attributes = [
    "name",
    "property",
    "charset",
    "viewport",
    "media",
    "http-equiv",
    "rel",
    "src",
    "href",
    "id",
  ];

  for (const attr of attributes) {
    const value = setup.isServer ? tag[attr] : tag.getAttribute(attr);

    if (value) return value;
  }
  return "";
};

/** @type {import('./types.d.ts').GetTagKey} */
export const getTagKey = (tag) => {
  const normalizedTag = setup.isServer
    ? { tagName: tag.name.toUpperCase(), ...parseAttributes(tag.propsStr) }
    : tag;

  return normalizedTag.tagName +
    (normalizedTag.tagName !== "TITLE"
      ? `.${getTagAttribute(normalizedTag)}`
      : "");
};
