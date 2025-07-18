/// <reference path="global.d.ts" />
import * as CSS from "csstype";

/**
 * Sets the attribute value of a given name of a given element.
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
 * Sets a namespaced attribute value of a given namespace, name and a given element.
 * Fallback to regular setAttribute automatically.
 *
 * @param namespace the namespace string
 * @param element the target element
 * @param key the attribute name
 * @param value the attribute value
 */
export const setAttributeNS: (
  namespace: string,
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
export const hydrate: <T = HTMLElement>(
  target: T,
  content:
    | HTMLElement
    | HTMLElement[]
    | JSX.Element
    | Promise<HTMLElement | HTMLElement[] | JSX.Element>,
) => T;
