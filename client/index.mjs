import van from "vanjs-core";
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

  // Filter empty text nodes — SSR omits them, client creates Text("")
  // from function children returning ""
  const cn1 = Array.from(el1.childNodes).filter((n) =>
    n.nodeType !== 3 || /* istanbul ignore next */ n.textContent !== ""
  );
  const cn2 = Array.from(el2.childNodes).filter((n) =>
    n.nodeType !== 3 || /* istanbul ignore next */ n.textContent !== ""
  );

  // istanbul ignore else
  if (cn1.length !== cn2.length) {
    return false;
  }

  // Only recurse if necessary (has childNodes with data-hk)
  const hasHydratedChildren = cn1.some((child) =>
    child instanceof HTMLElement &&
    (child.hasAttribute("data-hk") || child.querySelector("[data-hk]"))
  );

  // istanbul ignore next
  if (!hasHydratedChildren) {
    return true; // If no hydrated children, elements match based on initial checks
  }

  // Only recurse if opted in
  // istanbul ignore next
  return deep
    ? cn1.every((child, idx) => elementsMatch(child, cn2[idx]))
    : true;
}

function createHydrationContext() {
  /**
   * Significant child nodes: elements + non-empty text.
   * SSR omits empty text nodes while the client creates Text("") for
   * empty bindings, so those are filtered out on both sides.
   * @param {Element} el
   * @returns {ChildNode[]}
   */
  const significantChildren = (el) =>
    Array.from(el.childNodes).filter((n) =>
      n.nodeType !== 3 || n.textContent !== ""
    );

  /**
   * Whether an element carries a hydration key
   * @param {Node} el
   * @returns {el is Element}
   */
  const isKeyed = (el) => el instanceof Element && el.hasAttribute("data-hk");

  /**
   * Consume hydration keys under a freshly hydrated root: adoption is done,
   * subsequent renders are born keyless, so keys must not linger.
   * @param {Element} root
   */
  function stripHydrationKeys(root) {
    // istanbul ignore if - the diffed root is always an Element
    if (!(root instanceof Element)) return;
    if (root.hasAttribute("data-hk")) root.removeAttribute("data-hk");
    root.querySelectorAll("[data-hk]").forEach((el) =>
      el.removeAttribute("data-hk")
    );
  }

  /**
   * Whether two nodes can pair up: same kind, same tag/id/class, same text.
   * className is coerced to String so SVG (SVGAnimatedString) pairs by tag+id.
   * @param {ChildNode} oldN
   * @param {ChildNode} newN
   * @returns {boolean}
   */
  function nodesPairable(oldN, newN) {
    if (oldN.nodeType === 3 || newN.nodeType === 3) {
      return oldN.nodeType === newN.nodeType &&
        oldN.textContent === newN.textContent;
    }
    if (oldN.nodeType === 8 || newN.nodeType === 8) {
      return oldN.nodeType === newN.nodeType &&
        oldN.textContent === newN.textContent;
    }
    if (!(oldN instanceof Element) || !(newN instanceof Element)) {
      return false;
    }
    return oldN.tagName === newN.tagName &&
      (oldN.id || "") === (newN.id || "") &&
      String(oldN.className || "") === String(newN.className || "");
  }

  /**
   * Adopt a node pair. Keyed SSR elements are replaced with their fresh
   * client render (keys follow the client gate); static subtrees are walked
   * so untouched nodes (e.g. images) are never re-instantiated. Text nodes
   * are swapped for identical client ones so van bindings stay live.
   * @param {ChildNode} oldNode
   * @param {ChildNode} newNode
   */
  function adoptNode(oldNode, newNode) {
    if (isKeyed(oldNode)) {
      // istanbul ignore else - pairable nodes always share the same tag
      if (newNode instanceof Element && oldNode.tagName === newNode.tagName) {
        oldNode.replaceWith(newNode);
      }
      // else: no trustworthy counterpart — leave the SSR node in place
      return;
    }
    if (!(oldNode instanceof Element) || !(newNode instanceof Element)) return;
    const oldSiblings = significantChildren(oldNode);
    const newSiblings = significantChildren(newNode);
    if (
      oldSiblings.length !== newSiblings.length ||
      !oldSiblings.every((ok, i) => nodesPairable(ok, newSiblings[i]))
    ) {
      // structural divergence — swap the whole subtree with the fresh client render
      oldNode.replaceWith(newNode);
      return;
    }
    oldSiblings.forEach((os, i) => {
      const ns = newSiblings[i];
      if (os.nodeType === 3) {
        os.replaceWith(ns);
      } else {
        adoptNode(os, ns);
      }
    });
  }

  /** @type {(oldDom: HTMLElement, newDom: HTMLElement | HTMLElement[]) => HTMLElement} */
  function diffAndHydrate(oldDom, newDom) {
    if (!oldDom || !newDom) return;
    // SPA mode
    // istanbul ignore else
    if (!oldDom.children.length && !elementsMatch(oldDom, newDom)) {
      oldDom.replaceChildren(...unwrap(newDom).children);
      stripHydrationKeys(oldDom);
      return;
    }
    // istanbul ignore else
    if (newDom instanceof Array) {
      oldDom.replaceChildren(...unwrap(newDom).children);
      stripHydrationKeys(oldDom);
      return;
    }

    // SSR mode: adopt keyed elements 1:1 with fresh client renders,
    // leave static subtrees untouched
    const oldSiblings = significantChildren(oldDom);
    const newSiblings = significantChildren(newDom);
    if (
      oldSiblings.length !== newSiblings.length ||
      !oldSiblings.every((ok, i) => nodesPairable(ok, newSiblings[i]))
    ) {
      oldDom.replaceChildren(...newSiblings);
      stripHydrationKeys(oldDom);
      return;
    }
    oldSiblings.forEach((ok, i) => {
      const nk = newSiblings[i];
      if (ok.nodeType === 3) {
        ok.replaceWith(nk);
      } else {
        adoptNode(ok, nk);
      }
    });
    stripHydrationKeys(oldDom);
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
      hydrate(target, res);
    });
    return target;
  }
  if (typeof content === "function") {
    van.derive(() => {
      hydrate(target, content());
    });
    return target;
  }
  const wrapper = unwrap(content);
  const currentChildren = Array.from(target.children);
  const newChildren = Array.from(wrapper.children);

  if (target.tagName.toLowerCase() === "head") {
    // Keep current tags on first hydration
    if (!target.hasAttribute("data-h")) {
      target.setAttribute("data-h", "");
      return target;
    }

    // Replace all tags uniformly - styles/scripts are handled via imports
    newChildren.forEach((newChild) => {
      const key = getTagKey(newChild);
      const existing = currentChildren.find((child) =>
        getTagKey(child) === key
      );
      if (existing) {
        if (existing.outerHTML !== newChild.outerHTML) {
          existing.replaceWith(newChild);
        }
      } else {
        target.appendChild(newChild);
      }
    });
  } else {
    if (!target.hasAttribute("data-h")) {
      const { diffAndHydrate } = createHydrationContext();
      diffAndHydrate(target, content);
      target.setAttribute("data-h", "");
    } else {
      // target.replaceChildren(...newChildren);
      const parsed = [];
      for (const child of newChildren) {
        parsed.push(
          child instanceof Element
            ? child
            : /* istanbul ignore next */ String(child),
        );
      }
      target.replaceChildren(...parsed);
    }
  }
  return target;
};
