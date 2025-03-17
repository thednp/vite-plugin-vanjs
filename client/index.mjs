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

/**
 * @param {Element} target the root element
 * @param {Element | Element[] | Promise<Element | Element[]>} content the element(s) to hydrate
 */
export const hydrate = (target, content) => {
  if (content instanceof Promise) {
    content.then((res) => {
      const wrapper = unwrap(res);
      target.replaceChildren(
        ...(Array.from(wrapper.children)),
      );
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
      else /* istanbul ignore if - try again later */ if (isStyle(newChild)) {
        target.appendChild(newChild);
        /* istanbul ignore next - try again later */
        if (existing && existing.parentNode === target) {
          // Remove old one in next frame
          requestAnimationFrame(() => existing.remove());
        }
      }
    });
  } else {
    target.replaceChildren(...newChildren);
  }

  return target;
};
