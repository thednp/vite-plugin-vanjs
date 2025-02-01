declare module "@vanjs/parser" {
    export type DOMNode = {
        tagName?: string;
        nodeName: string;
        attributes: Record<string, string>;
        children: DOMNode[];
        value?: string;
    }

    export type ParseResult = {
        root: DOMNode,
        components: string[],
        tags: string[],
    }

    export type HTMLToken = {
        type: string;
        value: string;
    }

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
}