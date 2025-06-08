import { unwrap } from "../router/unwrap.mjs";
import { getTagKey } from "../meta/helpers.mjs";

/**
 * @param {Element} element
 * @param {string} key
 * @param {boolean | string | number | null | undefined} value
 */
export const setAttribute = (element, key, value) => {
  if (value == null || value === false || value === "" || value === undefined) {
    element.removeAttribute(key);
  } else {
    const attr = value === true ? "" : String(value);
    element.setAttribute(key, attr);
  }
};

/**
 * Sets or removes an attribute with the specified or inferred namespace on an element.
 *
 * @param {string|null} ns - The namespace URI (e.g., 'http://www.w3.org/2000/svg') or null to infer from element.
 * @param {Element} element - The DOM element to modify.
 * @param {string} key - The attribute name (e.g., 'stroke-width', 'xlink:href').
 * @param {string|boolean|null|undefined} value - The attribute value; falsy values remove the attribute.
 */
export const setAttributeNS = (ns, element, key, value) => {
  // Infer namespace from element if ns is null
  const elementNS = ns || element.namespaceURI ||
    /* istanbul ignore next - this is a required fallback */ null;

  // Map attributes to specific namespaces
  const attrNamespaces = {
    "xlink:": "http://www.w3.org/1999/xlink", // XLink attributes (e.g., xlink:href)
    "xml:": "http://www.w3.org/XML/1998/namespace", // XML attributes (e.g., xml:lang)
    "xsi:": "http://www.w3.org/2001/XMLSchema-instance", // XML Schema Instance (e.g., xsi:schemaLocation)
  };

  // Determine attribute namespace
  let attrNS = elementNS;
  for (const [prefix, uri] of Object.entries(attrNamespaces)) {
    if (key.startsWith(prefix)) {
      attrNS = uri;
      break;
    }
  }

  if (value == null || value === false || value === "" || value === undefined) {
    // Remove attribute
    try {
      // istanbul ignore else - case may not be covered by happy-dom?
      if (attrNS && attrNS !== "null") {
        // Strip prefix (e.g., xlink:href -> href)
        element.removeAttributeNS(attrNS, key.replace(/^[^:]+:/, ""));
      } else {
        // istanbul ignore next - case may not be covered by happy-dom?
        element.removeAttribute(key);
        // istanbul ignore next - case may not be covered by happy-dom?
        element.removeAttribute(key.replace(/^[^:]+:/, ""));
      }
    } catch (_e) {
      // Silent fail: attribute may not exist
    }
  } else {
    // Set attribute
    const attr = value === true ? key.replace(/^[^:]+:/, "") : String(value);
    try {
      element.setAttributeNS(attrNS, key, attr);
    } catch (_e) {
      // Fallback to non-namespaced set
      // istanbul ignore next - case may not be covered by happy-dom?
      element.setAttribute(key, attr);
    }
  }
};

/**
 * @param {import("csstype").Properties | string} style
 * @returns {string}
 */
export const styleToString = (style) => {
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
      // allow state values in style object
      (typeof value === "object" && "val" in value ? value.val : value) +
      ";", "")
    : /* istanbul ignore next */ "";
};

/** @type {(el1: HTMLElement, el2: HTMLElement | HTMLElement[], deep?: boolean) => boolean} */
export function elementsMatch(el1, el2, deep) {
  // Quick initial checks before recursing
  // istanbul ignore else
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

  // istanbul ignore else
  if (childNodes1.length !== childNodes2.length) {
    return false;
  }

  // Only recurse if necessary (has childNodes with data-hk)
  const hasHydratedChildren = childNodes1.some((child) =>
    child instanceof HTMLElement && (child.hasAttribute("data-hk") ||
      child.querySelector("[data-hk]"))
  );

  // istanbul ignore next
  if (!hasHydratedChildren) {
    return true; // If no hydrated children, elements match based on initial checks
  }

  // Only recurse if opted in
  // istanbul ignore next
  return deep
    ? childNodes1.every((child, idx) => elementsMatch(child, childNodes2[idx]))
    : true;
}

/** @type {<E extends Element = Element, T extends keyof HTMLElementTagNameMap>(target: E, ...tagNames: T[]) => boolean} */
const isTag = (target, ...tagNames) => {
  return tagNames.some((tag) =>
    target.tagName.toLowerCase() === tag.toLowerCase()
  );
};

function createHydrationContext() {
  /** @type {WeakMap<Element, Element>} */
  const parentCache = new WeakMap();

  /** @type {(element: HTMLElement, root: HTMLElement) => HTMLElement | null} */
  function getParent(element, root) {
    const cacheKey = element;
    // istanbul ignore if - must be connected to a read DOM
    if (parentCache.has(cacheKey)) {
      const cached = parentCache.get(cacheKey);
      // Verify the cached parent is still valid for this root
      if (cached && cached.isConnected && root.contains(cached)) {
        return cached;
      }
      // If not valid, remove from cache
      parentCache.delete(cacheKey);
    }

    const chain = [];
    let current = element;

    while (current !== root && current) {
      chain.push(current);
      current = current.parentElement;
    }

    const parent = chain.slice(-1)[0];
    // istanbul ignore else
    if (parent) {
      parentCache.set(cacheKey, parent);
    }
    return parent;
  }

  /** @type {(oldDom: HTMLElement, newDom: HTMLElement | HTMLElement[]) => HTMLElement} */
  function diffAndHydrate(oldDom, newDom) {
    if (!oldDom || !newDom) return;
    // SPA mode
    // istanbul ignore else
    if (!oldDom.children.length && !elementsMatch(oldDom, newDom)) {
      return oldDom.replaceChildren(...unwrap(newDom).children);
    }
    // istanbul ignore else
    if (newDom instanceof Array) {
      oldDom.replaceChildren(...unwrap(newDom).children);
      return;
    }

    // SSR Mode
    /** @type {Set<HTMLElement>} */
    const oldSet = new Set();
    /** @type {Set<HTMLElement>} */
    const newSet = new Set();

    const processElements = (root, set) => {
      const elements = root.querySelectorAll("[data-hk]");
      let lastParent = null;

      elements.forEach((el) => {
        const parent = getParent(el, root);
        if (parent && parent !== lastParent) {
          set.add(parent);
          lastParent = parent;
        }
      });
    };

    processElements(oldDom, oldSet);
    processElements(newDom, newSet);

    // istanbul ignore else
    if (newSet.size > 0) {
      const newArray = Array.from(newSet);
      oldSet.forEach((el) => {
        const match = newArray.find((m) => elementsMatch(m, el));
        // istanbul ignore else
        if (match) {
          el.replaceWith(match);
        }
      });
    }
  }

  return { diffAndHydrate };
}
/**
 * @param {Element} target the root element
 * @param {Element | Element[] | Promise<Element | Element[]>} content the element(s) to hydrate
 */
export const hydrate = (target, content) => {
  if (content instanceof Promise) {
    content.then((res) => {
      if (!target.hasAttribute("data-h")) {
        const { diffAndHydrate } = createHydrationContext();
        diffAndHydrate(target, res);
        target.setAttribute("data-h", "");
      } else {
        const wrapper = unwrap(res);
        target.replaceChildren(
          ...(Array.from(wrapper.children)),
        );
      }
    });
    return target;
  }

  const wrapper = unwrap(content);
  const currentChildren = Array.from(target.children);
  const newChildren = Array.from(wrapper.children);

  if (isTag(target, "head")) {
    // Keep current tags on first hydration
    if (!target.hasAttribute("data-h")) {
      target.setAttribute("data-h", "");
      return target;
    }

    // Handle non-style/link tags first
    const regularTags = newChildren.filter((child) =>
      !isTag(child, "style", "link")
    );

    // Handle style/link tags separately
    const styleTags = newChildren.filter((child) =>
      isTag(child, "style", "link")
    );

    // Create maps for existing tags
    const existingStyles = new Map(
      currentChildren.filter((child) => isTag(child, "style", "link"))
        .map((child) => [getTagKey(child), child]),
    );

    // Process regular tags normally
    regularTags.forEach((newChild) => {
      const key = getTagKey(newChild);
      const existing = currentChildren.find((child) =>
        getTagKey(child) === key
      );
      if (existing) {
        existing.replaceWith(newChild);
      } else {
        target.appendChild(newChild);
      }
    });

    // Process style tags with special handling
    styleTags.forEach((newChild) => {
      const key = getTagKey(newChild);
      const existing = existingStyles.get(key);

      // Skip if tag already exists with same content+id/href
      if (existing) {
        // istanbul ignore next - try again later
        if (isTag(existing, "style") && isTag(newChild, "style")) {
          if (
            existing.textContent === newChild.textContent &&
            existing.id === newChild.id
          ) return;
        }
        // istanbul ignore next - try again later
        if (isTag(existing, "link") && isTag(newChild, "link")) {
          if (existing.href === newChild.href) return;
        }
      }

      // For link tags, add with disabled state first
      // istanbul ignore else - try again later
      if (isTag(newChild, "link")) {
        const temp = newChild.cloneNode();
        temp.disabled = true;

        const originalRel = temp.rel;
        temp.rel = "preload";
        temp.as = "style";
        // istanbul ignore next
        temp.onload = () => {
          temp.rel = originalRel;
          temp.removeAttribute("as");
          temp.disabled = false;
          if (existing && existing.parentNode === target) {
            existing.remove();
          }
        };

        target.appendChild(temp);
      } // For style tags, add new one first
      else if (isTag(newChild, "style")) {
        target.appendChild(newChild);
        // istanbul ignore next - try again later
        if (existing && existing.parentNode === target) {
          // Remove old one in next frame
          existing.remove();
        }
      }
    });
  } else {
    if (!target.hasAttribute("data-h")) {
      const { diffAndHydrate } = createHydrationContext();
      diffAndHydrate(target, content);
      target.setAttribute("data-h", "");
    } else {
      target.replaceChildren(...newChildren);
    }
  }

  return target;
};
