import setup from "@vanjs/setup";

/** @type {typeof import('./types.d.ts').parseAttributes} */
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

/** @type {typeof import('./types.d.ts').getTagKey} */
export const getTagKey = (tag) => {
  const normalizedTag = setup.isServer
    ? { tagName: tag.name.toUpperCase(), ...parseAttributes(tag.propsStr) }
    : tag;

  return normalizedTag.tagName +
    (normalizedTag.tagName !== "TITLE"
      ? `.${getTagAttribute(normalizedTag)}`
      : "");
};

/** @type {typeof import('./types.d.ts').extractTags} */
export const extractTags = async (html) => {
  const { htmlToVanCode } = await import("vanjs-converter");
  const tagFuncs = await import("./tags.mjs");
  const { parse } = await import("json5");
  const output = [];

  const { tags, code } = htmlToVanCode(html, { skipEmptyText: true, indent: 0 });
  let i = 0;
  for (const line of code) {
    const [tag, propsStr] = line.replace(/\)\,/g, "").split("(");
    if (tag?.length && tags.includes(tag)) {
      const tagName = tag[0].toUpperCase() + tag.slice(1);
      if (tagName?.length && typeof tagFuncs[tagName] === "function") {
        const props = tag === "title" ? code[i + 1].replace(/\"/g, "") : parse(propsStr || "{}");

        output.push({ tag: tagFuncs[tagName], [tag === "title" ? "content" : "props"]: props });
      }
    }
    i += 1;
  }

  return output;
};