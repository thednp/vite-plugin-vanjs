/*!
* vite-plugin-vanjs Client v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { StateView } from "vanjs-core";
import { Properties, PropertiesHyphen, SvgProperties, SvgPropertiesHyphen } from "csstype";

//#region src/types/dom-types.d.ts
type AllCSSProperties = Properties & PropertiesHyphen & SvgProperties & SvgPropertiesHyphen;
type CSSProperties = { // [key: `-${string}`]: StateMaybe<AllCSSProperties[K]>
[K in keyof AllCSSProperties]: StateMaybe<AllCSSProperties[K]> };
//#endregion
//#region src/types/types.d.ts
type Accessor<T> = () => T;
type StateMaybe<T = unknown> = Accessor<T> | StateView<T> | T | undefined;
type FunctionMaybe<T = unknown> = Accessor<T> | T;
type DOMElement = HTMLElement | SVGElement;
//#endregion
//#region src/client/types.d.ts
type StyleValue = CSSProperties | StateMaybe<string>;
//#endregion
//#region src/client/index.d.ts
/**
 * Sets the attribute value of a given name of a given element.
 *
 * @param element the target element
 * @param key the attribute name
 * @param value the attribute value
 */
declare function setAttribute(element: Element, key: string, value: boolean | string | number | null | undefined): void;
/**
 * Sets a namespaced attribute value of a given namespace,
 * name and a given element. Fallback to regular setAttribute
 * automatically.
 *
 * @param namespace the namespace string
 * @param element the target element
 * @param key the attribute name
 * @param value the attribute value
 */
declare function setAttributeNS(ns: string | null, element: Element, key: string, value: string | boolean | null | undefined): void;
/**
 * Normalize the style value and convert it to a string
 *
 * @param source the style value
 * @returns the normalized style string
 */
declare function styleToString(style: StyleValue): string;
declare function elementsMatch(el1: DOMElement, el2: DOMElement | DOMElement[], deep?: boolean): boolean;
/**
 * Hydrate a target element with the given content(s).
 *
 * @param target the root element
 * @param content the element(s) to hydrate
 */
declare function hydrate<T extends DOMElement>(target: T, content: FunctionMaybe<DOMElement | DOMElement[]> | Promise<DOMElement | DOMElement[]>): T;
//#endregion
export { StyleValue, elementsMatch, hydrate, setAttribute, setAttributeNS, styleToString };
//# sourceMappingURL=client.d.mts.map