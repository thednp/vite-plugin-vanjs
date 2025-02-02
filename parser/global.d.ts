declare module "@vanjs/parser" {
    import type { DOMLike, RootNode, ParseResult, ParserOptions } from "@thednp/domparser";

    export {
        RootNode,
        DOMLike,
        ParseResult,
        ParserOptions,
    }

    export type HTMLToken = {
        type: string;
        value: string;
    }

    export type VanJSCode = { code: string, tags: string[], components: string[], attributes: Record<string, string> }

    export const DOMToVan: (node: DOMLike) => string

    export type ConvertedOptions = ParserOptions & { replacement?: string }

    /**
     * Converts HTML to VanJS code.
     */
    export const htmlToVanCode: (input?: string, converterOptions?: ConvertedOptions) => VanJSCode

    /** Converts HTML to DOMNode */
    export const htmlToDOM: (input?: string) => ParseResult

    /**
     * Returns a quoted string if the key is a valid identifier,
     * otherwise returns the original key.
     */
    export const quoteText: (key: string) => string;
}