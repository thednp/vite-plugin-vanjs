import { unwrap } from "../router/index.mjs";
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

/** @type {(el1: HTMLElement, el2: HTMLElement | HTMLElement[]) => boolean} */
export function elementsMatch(el1, el2) {
  // Quick initial checks before recursing
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

  // Only recurse if necessary (has childNodes with data-hk)
  const hasHydratedChildren = childNodes1.some((child) =>
    child instanceof HTMLElement && (child.hasAttribute("data-hk") ||
      child.querySelector("[data-hk]"))
  );

  if (!hasHydratedChildren) {
    return true; // If no hydrated children, elements match based on initial checks
  }

  return childNodes1.every((child, idx) =>
    elementsMatch(child, childNodes2[idx])
  );
}

function createHydrationContext() {
  /** @type {WeakMap<Element, Element>} */
  const parentCache = new WeakMap();

  /** @type {(oldDom: HTMLElement, newDom: HTMLElement) => HTMLElement | null} */
  function getParent(element, root) {
    const cacheKey = element;
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
    if (parent) {
      parentCache.set(cacheKey, parent);
    }
    return parent;
  }

  /** @type {(oldDom: HTMLElement, newDom: HTMLElement) => HTMLElement} */
  function diffAndHydrate(oldDom, newDom) {
    // SPA mode
    if (!oldDom.children.length && !elementsMatch(oldDom, newDom)) {
      return oldDom.replaceChildren(...unwrap(newDom).children);
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
 * @param {Element} target the root element
 * @param {Element | Element[] | Promise<Element | Element[]>} content the element(s) to hydrate
 */
export const hydrate = (target, content) => {
  if (content instanceof Promise) {
    content.then((res) => {
      if (!target.hasAttribute("data-h")) {
        const { diffAndHydrate } = createHydrationContext();
        diffAndHydrate(target, content);
        target.setAttribute("data-h", "");
      } else {
        const wrapper = unwrap(res).children;
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
  const isStyleLink = (tag) =>
    [HTMLStyleElement, HTMLLinkElement].some((e) => tag instanceof e);
  const isStyle = (tag) => tag instanceof HTMLStyleElement;
  const isLink = (tag) => tag instanceof HTMLLinkElement;

  if (target.tagName.toLowerCase() === "head") {
    // Keep current tags on first hydration
    if (!target.hasAttribute("data-h")) {
      target.setAttribute("data-h", "");
      return target;
    }

    // Handle non-style/link tags first
    const regularTags = newChildren.filter((child) => !isStyleLink(child));

    // Handle style/link tags separately
    const styleTags = newChildren.filter((child) => isStyleLink(child));

    // Create maps for existing tags
    const existingStyles = new Map(
      currentChildren.filter(isStyleLink)
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
        /* istanbul ignore next - try again later */
        if (isStyle(existing) && isStyle(newChild)) {
          if (
            existing.textContent === newChild.textContent &&
            existing.id === newChild.id
          ) return;
        }
        /* istanbul ignore next - try again later */
        if (isLink(existing) && isLink(newChild)) {
          if (existing.href === newChild.href) return;
        }
      }

      // For link tags, add with disabled state first
      if (isLink(newChild)) {
        const temp = newChild.cloneNode();
        temp.disabled = true;

        const originalRel = temp.rel;
        temp.rel = "preload";
        temp.as = "style";
        /* istanbul ignore next */
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
      /* istanbul ignore if - try again later */ else if (isStyle(newChild)) {
        target.appendChild(newChild);
        /* istanbul ignore next - try again later */
        if (existing && existing.parentNode === target) {
          // Remove old one in next frame
          requestAnimationFrame(() => existing.remove());
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
