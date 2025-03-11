declare module "@vanjs/client" {
  import * as CSS from "csstype";
  import type {
    Element as VanElement,
    TagFunc,
  } from "mini-van-plate/van-plate";

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

  type ChildElement = TagFunc | VanElement | HTMLElement | SVGElement;

  /**
   * Hydrate the target element with the given content(s).
   *
   * @param target the target element
   * @param content the element(s) to hydrate
   */
  export const hydrate: (
    target: HTMLElement,
    content:
      | ChildElement
      | ChildElement[]
      | Promise<ChildElement | ChildElement[]>,
  ) => HTMLElement;
}
