import { unwrap } from "vite-plugin-vanjs/router";
import { getTagKey } from "vite-plugin-vanjs/meta";
import type { DOMElement, FunctionMaybe } from "../types/types.d.ts";
import type { StyleValue } from "./types.d.ts";
export type * from "./types.d.ts";

/**
 * Sets the attribute value of a given name of a given element.
 *
 * @param element the target element
 * @param key the attribute name
 * @param value the attribute value
 */
export function setAttribute(
  element: Element,
  key: string,
  value: boolean | string | number | null | undefined,
): void {
  if (value == null || value === false || value === "" || value === undefined) {
    element.removeAttribute(key);
  } else {
    const attr = value === true ? "" : String(value);
    element.setAttribute(key, attr);
  }
}

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
export function setAttributeNS(
  ns: string | null,
  element: Element,
  key: string,
  value: string | boolean | null | undefined,
): void {
  const elementNS = ns || element.namespaceURI || null;

  const attrNamespaces: Record<string, string> = {
    "xlink:": "http://www.w3.org/1999/xlink",
    "xml:": "http://www.w3.org/XML/1998/namespace",
    "xsi:": "http://www.w3.org/2001/XMLSchema-instance",
  };

  let attrNS: string | null = elementNS;
  for (const [prefix, uri] of Object.entries(attrNamespaces)) {
    if (key.startsWith(prefix)) {
      attrNS = uri;
      break;
    }
  }

  if (value == null || value === false || value === "" || value === undefined) {
    try {
      if (attrNS && attrNS !== "null") {
        element.removeAttributeNS(attrNS, key.replace(/^[^:]+:/, ""));
      } else {
        element.removeAttribute(key);
        element.removeAttribute(key.replace(/^[^:]+:/, ""));
      }
    } catch {
      // Silent fail: attribute may not exist
    }
  } else {
    const attr = value === true ? key.replace(/^[^:]+:/, "") : String(value);
    try {
      element.setAttributeNS(attrNS, key, attr);
    } catch {
      element.setAttribute(key, attr);
    }
  }
}

/**
 * Normalize the style value and convert it to a string
 *
 * @param source the style value
 * @returns the normalized style string
 */
export function styleToString(style: StyleValue): string {
  return typeof style === "string"
    ? style
    : typeof style === "object"
    ? Object.entries(style).reduce((acc, [key, value]) =>
      acc +
      key
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase() +
      ":" +
      (typeof value === "object" && value !== null && "val" in value
        ? (value as { val: unknown }).val
        : value) +
      ";", "")
    : "";
}

export function elementsMatch(
  el1: DOMElement,
  el2: DOMElement | DOMElement[],
  deep?: boolean,
): boolean {
  if (
    !(el2 instanceof HTMLElement) ||
    el1.tagName !== el2.tagName ||
    el1.id !== el2.id ||
    el1.className !== el2.className
  ) {
    return false;
  }

  const childNodes1 = Array.from(el1.childNodes);
  const childNodes2 = Array.from(el2.childNodes);

  if (childNodes1.length !== childNodes2.length) {
    return false;
  }

  const hasHydratedChildren = childNodes1.some((child) =>
    child instanceof HTMLElement && (child.hasAttribute("data-hk") ||
      child.querySelector("[data-hk]"))
  );

  if (!hasHydratedChildren) {
    return true;
  }

  return deep
    ? childNodes1.every((child, idx) =>
      elementsMatch(child as DOMElement, childNodes2[idx] as DOMElement)
    )
    : true;
}

function createHydrationContext() {
  const parentCache = new WeakMap<DOMElement, DOMElement>();

  function getParent(element: DOMElement, root: DOMElement): DOMElement | null {
    const cacheKey = element;
    if (parentCache.has(cacheKey)) {
      const cached = parentCache.get(cacheKey);
      if (cached && cached.isConnected && root.contains(cached)) {
        return cached;
      }
      parentCache.delete(cacheKey);
    }

    const chain: DOMElement[] = [];
    let current: DOMElement | null = element;

    while (current !== root && current) {
      chain.push(current);
      current = current.parentElement;
    }

    const parent = chain.slice(-1)[0];
    if (parent) {
      parentCache.set(cacheKey, parent);
    }
    return (parent as HTMLElement | null) ?? null;
  }

  function diffAndHydrate(
    oldDom: DOMElement,
    newDom: DOMElement | DOMElement[],
  ): void {
    if (!oldDom || !newDom) return;
    if (!oldDom.children.length && !elementsMatch(oldDom, newDom)) {
      oldDom.replaceChildren(...unwrap(newDom).children as never[]);
      return;
    }
    if (newDom instanceof Array) {
      oldDom.replaceChildren(...unwrap(newDom).children as never[]);
      return;
    }

    const oldSet = new Set<HTMLElement>();
    const newSet = new Set<HTMLElement>();

    const processElements = (root: DOMElement, set: Set<DOMElement>) => {
      const elements = root.querySelectorAll("[data-hk]");
      let lastParent: DOMElement | null = null;

      elements.forEach((el) => {
        const parent = getParent(el as HTMLElement, root);
        if (parent && parent !== lastParent) {
          set.add(parent);
          lastParent = parent;
        }
      });
    };

    processElements(oldDom, oldSet);
    processElements(newDom as HTMLElement, newSet);

    if (newSet.size > 0) {
      const newArray = Array.from(newSet);
      oldSet.forEach((el) => {
        const match = newArray.find((m) => elementsMatch(m, el));
        if (match) {
          el.replaceWith(match);
        }
      });
    }
  }

  return { diffAndHydrate };
}

/**
 * Hydrate a target element with the given content(s).
 *
 * @param target the root element
 * @param content the element(s) to hydrate
 */
export function hydrate<T extends DOMElement>(
  target: T,
  content:
    | FunctionMaybe<DOMElement | DOMElement[]>
    | Promise<DOMElement | DOMElement[]>,
): T {
  if (content instanceof Promise) {
    content.then((res) => {
      if (!target.hasAttribute("data-h")) {
        const { diffAndHydrate } = createHydrationContext();
        diffAndHydrate(target, res);
        target.setAttribute("data-h", "");
      } else {
        const wrapper = unwrap(res);
        target.replaceChildren(...(Array.from(wrapper.children) as never[]));
      }
    });
    return target;
  }

  const wrapper = unwrap(content);
  const currentChildren = Array.from(target.children);
  const newChildren = Array.from(wrapper.children);

  if (target.tagName.toLowerCase() === "head") {
    if (!target.hasAttribute("data-h")) {
      target.setAttribute("data-h", "");
      return target;
    }

    newChildren.forEach((newChild) => {
      const key = getTagKey(newChild as never);
      const existing = currentChildren.find((child) =>
        getTagKey(child as never) === key
      );
      if (existing) {
        existing.replaceWith(newChild as Node);
      } else {
        target.appendChild(newChild as Node);
      }
    });
  } else {
    if (!target.hasAttribute("data-h")) {
      const { diffAndHydrate } = createHydrationContext();
      diffAndHydrate(
        target as HTMLElement,
        content as HTMLElement | HTMLElement[],
      );
      target.setAttribute("data-h", "");
    } else {
      target.replaceChildren(...(newChildren as never[]));
    }
  }

  return target;
}
