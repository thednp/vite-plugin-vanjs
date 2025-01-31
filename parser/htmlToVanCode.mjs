import { htmlToDOM } from "./htmlToDOM.mjs";
import DOMParser from "@thednp/domparser";

/** @typedef {import("@vanjs/parser").DOMNode} DOMNode */
/** @typedef {import("@vanjs/parser").ParseResult} ParseResult */
/** @typedef {typeof import("@vanjs/parser").htmlToVanCode} htmlToVanCode */

/**
 * Converts a `DOMNode` to a VanJS code string
 * @param {Omit<DOMNode, "attributes"> & { attributes: string | Record<string, string> }=} input 
 */
const DOMToVan = (input) => {
  // if (!input) return '';

  const { tagName, nodeName, attributes, children, value } = input;
  const isReplacement = typeof attributes === 'string';
  const isText = nodeName === '#text';
  const firstChildIsText = children.length && children[0].nodeName === '#text';

  const attributeEntries = isReplacement ? [] : Object.entries(attributes);

  let output = isText ? '' : `${tagName}(`;
  if (attributeEntries.length || isReplacement) {
    const attributesHTML = isReplacement ? attributes : attributeEntries.map(([key, value]) => `${DOMParser.quoteText(key)}: "${value}"`).join(', ');
    output += isReplacement ? attributesHTML : `{ ${attributesHTML} }`;
    output += children.length ? ',' : '';
  }
  if (children.length) {
    const childrenHTML = children.map(child => (firstChildIsText ? "" : "\n  ") + DOMToVan(child)).join(',');
    output += `${childrenHTML}`;
  }
  if (value) {
    output += `"${value}"`;
  }
  output += isText ? '' : (children.length && children[0].tagName !== '#text' ? '\n)' : ')');

  return output;
}



/**
 * Converts HTML to VanJS code.
 * 
 * @type {htmlToVanCode}
 */
export const htmlToVanCode = (input, replacement) => {
  const { root, components, tags } = htmlToDOM(input);
  if (!root?.children.length) return { code: '', tags: [], components: [], attributes: {} };
  const { tagName, nodeName, attributes, children } = root.children[0];
  const code = DOMToVan({ tagName, nodeName, attributes: replacement || attributes, children });

  return { code, tags, components, attributes };
}
