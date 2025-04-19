/// <reference path="global.d.ts" />
import * as CSS from "csstype";

/**
 * Sets the attribute value of the given name of the given element.
 *
 * @param element the target element
 * @param key the attribute name
 * @param value the attribute value
 */
export const setAttribute: (
  element: Element,
  name: string,
  value: boolean | string | number | null | undefined,
) => void;

/**
 * Normalize the style value and convert it to a string
 *
 * @param source the style value
 * @returns the normalized style string
 */
export const styleToString: (source: string | CSS.Properties) => string;

/**
 * Hydrate a target element with the given content(s).
 *
 * @param target the root element
 * @param content the element(s) to hydrate
 */
export const hydrate: (
  target: HTMLElement,
  content:
    | HTMLElement
    | HTMLElement[]
    | JSX.Element
    | Promise<HTMLElement | HTMLElement[] | JSX.Element>,
) => HTMLElement;
