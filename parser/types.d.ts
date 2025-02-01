/// <reference path="global.d.ts" />
import type { DOMNode, ParseResult } from "@thednp/domparser";

export type VanJSCode = { code: string, tags: string[], components: string[], attributes: Record<string, string> }

export const DOMToVan: (node: DOMNode) => string

/**
 * Converts HTML to VanJS code.
 */
export const htmlToVanCode: (input?: string, replacement?: string) => VanJSCode

/** Converts HTML to DOMNode */
export const htmlToDOM: (input?: string) => { root: DOMNode, components: string[], tags: string[] }

/**
 * Returns a quoted string if the key is a valid identifier,
 * otherwise returns the original key.
 */
export const quoteText: (key: string) => string;
