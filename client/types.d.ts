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

/**
 * Shallow compare two elements, optionally recursing into keyed children.
 *
 * @param el1 the server rendered element
 * @param el2 the client rendered element or elements
 * @param deep when true, compares the hydrated children of both elements
 */
export const elementsMatch: (
  el1: HTMLElement,
  el2: HTMLElement | HTMLElement[],
  deep?: boolean,
) => boolean;
