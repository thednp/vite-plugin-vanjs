import { Parser } from "@thednp/domparser";

/** @typedef {typeof import("@vanjs/parser").htmlToDOM} htmlToDOM */

/**
 * Converts HTML to VanJS code.
 * 
 * @type {htmlToDOM}
 */
export const htmlToDOM = (input) => {
  if (!input) return { root: { nodeName: '#document', children: [] }, tags: [], components: [] };
  if (typeof input !== 'string') throw new TypeError('input must be a string');
  const parser = Parser();
  return parser.parseFromString(input);
}
