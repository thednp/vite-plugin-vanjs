/// <reference path="global.d.ts" />
import type { DOMLike, RootNode, ParseResult, ParserOptions } from "@thednp/domparser";

export type VanJSCode = { code: string, tags: string[], components: string[], attributes: Record<string, string> }

export const DOMToVan: (node: DOMLike) => string

export type ConvertedOptions = ParserOptions & { replacement?: string }

/**
 * Converts HTML to VanJS code.
 */
export const htmlToVanCode: (input?: string, converterOptions?: ConvertedOptions) => VanJSCode

/** Converts HTML to DOMLike */
export const htmlToDOM: (input?: string, options?: Partial<ParserOptions>) => ParseResult

/**
 * Returns a quoted string if the key is a valid identifier,
 * otherwise returns the original key.
 */
export const quoteText: (key: string) => string;
