import { htmlToDOM } from "./htmlToDOM.mjs";
import { quoteText } from "./quoteText.mjs";

/** @typedef {import("@vanjs/parser").DOMNode} DOMNode */
/** @typedef {import("@vanjs/parser").ParseResult} ParseResult */
/** @typedef {typeof import("@vanjs/parser").htmlToVanCode} htmlToVanCode */

/**
 * Converts a `DOMNode` to a VanJS code string
 * @param {Omit<DOMNode, "attributes"> & { attributes: string | Record<string, string> }} input 
 * @param {number=} depth 
 */
const DOMToVan = (input, depth = 0) => {
  const { tagName, nodeName, attributes, children, value } = input;
  const isReplacement = typeof attributes === 'string';
  const isText = nodeName === '#text';
  const firstChildIsText = children?.[0]?.nodeName === '#text';
  const attributeEntries = isReplacement ? [] : Object.entries(attributes || {});
  const spaces = "  ".repeat(depth); // Calculate spaces based on depth
  let output = isText ? '' : (spaces + `${tagName}(`);

  if (attributeEntries.length || isReplacement) {
    const attributesHTML = isReplacement ? attributes : attributeEntries.map(([key, value]) => `${quoteText(key)}: "${value}"`).join(', ');
    output += isReplacement ? attributesHTML : `{ ${attributesHTML} }`;
    output += children.length ? ',' : '';
  }
  if (children?.length) {
    const childrenHTML = children
    // Increase depth for children
      .map(child => (firstChildIsText ? (attributeEntries.length ? " " : "") : ("\n" + "  ".repeat(depth + 1))) + DOMToVan(child, depth + 1))
      .join(',');
    output += `${childrenHTML}`;
  }
  if (value) {
    output += `"${value}"`;
  }
  // Adjust newline for closing bracket
  output += isText ? "" : (children.length && !firstChildIsText ? ("\n" + "  ".repeat(depth + 1) + ')') : (')'));

  return output;
}

/**
 * Converts HTML markup to VanJS code.
 * 
 * @type {htmlToVanCode}
 */
export const htmlToVanCode = (input, options = {}) => {
  const { replacement, ...parserOptions } = options;
  const { root, components, tags } = htmlToDOM(input, parserOptions);
  if (!root?.children.length) return { code: '', tags: [], components: [], attributes: {} };
  const { tagName, nodeName, attributes, children } = root.children[0];
  const code = DOMToVan({ tagName, nodeName, attributes: replacement || attributes, children });

  return { code, tags, components, attributes };
}
