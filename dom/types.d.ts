/// <reference path="global.d.ts" />
import * as CSS from "csstype";

/**
 * Sets the attribute value of the given name of the given element.
 *
 * @param element the target element
 * @param key the attribute name
 * @param value the attribute value
 */
export const setAttribute: (element: Element, name: string, value: boolean | string | number | null | undefined) => void;

/**
 * Normalize the style value and convert it to a string
 *
 * @param source the style value
 * @returns the normalized style string
 */
export const styleToString: (source: string | CSS.Properties) => string;

/**
 * Hydrate the root element with the given content.
 *
 * @param root the root element
 * @param content the element(s) to hydrate
 */
export const hydrateRoot: (root: Element, content: Element | Element[]) => Element;
