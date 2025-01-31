import setup from "@vanjs/setup";
import { htmlToDOM } from "@vanjs/parser";
import * as tagFuncs from "./tags.mjs";

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

/**
  * Typical HTML structure
  * ```
  * <html>
  *  <head>
  *    <meta charset="UTF-8">
  *    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  *    <link rel="icon" type="image/svg+xml" href="/vite.svg">
  *    <title>VanJS + Vite Homepage</title>
  *    <meta name="description" content="Home description">
  *    <style type="text/css">@layer theme, base, components, utilities;</style>
  *  </head>
  *  <body>
  *    <div id="app"></div>
  *  </body>
  * </html>
  * ```
 * @type {typeof import('./types.d.ts').extractTags}
 */
export const extractTags = (html = "") => {
  const output = [];
  if (!html) return output;

  const {root, tags} = htmlToDOM(html);
  // HEAD
  /** @type {{ tagName?: string; nodeName: string; attributes: Record<string, string>; children: DOMNode[]; }} */
  const { tagName, children } = root.children[0].tagName === "head" ? root.children[0]
    : root.children[0].children[0].tagName === 'head' ? root.children[0].children[0]
    : null;

  if (tagName === "head") {
    for (const child of children) {
      const { tagName: childTagName, attributes, children: childChildren } = child;

      if (childTagName?.length && tags.includes(childTagName)) {
        /** @type {keyof typeof tagFuncs} */
        const key = childTagName[0].toUpperCase() + childTagName.slice(1);
        if (key?.length && typeof tagFuncs[key] === "function") {
          output.push({
            tag: tagFuncs[key],
            props: attributes,
            children: childChildren[0]?.value || childChildren,
          });
        }
      }
    }
  }

  return output;
};
