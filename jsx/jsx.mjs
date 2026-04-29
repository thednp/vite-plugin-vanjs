/// <reference types="./jsx.d.ts" />

import van from "vanjs-core";
import isServer from "../setup/isServer.mjs";
import { setAttributeNS, styleToString } from "../client/index.mjs";
import { namespaceElements } from "./ns.mjs";
import { env, registerEnv } from "mini-van-plate/shared"
import * as vanServer from 'mini-van-plate/van-plate';

/**
 * Compiles JSX to VanJS elements with automatic namespace resolution.
 *
 * @param {string|Function} jsxTag - The tag name (e.g., 'svg') or component function.
 * @param {Object} props - Props including children, ref, style, and attributes.
 * @returns {Element|null} The compiled VanJS element or null for invalid tags.
 */
export const jsx = (jsxTag, { children, ref, style, ...rest }) => {
  // Filter props with undefined values
  const props = Object.fromEntries(
    Object.entries(rest).filter(([_, val]) => val !== undefined),
  );

  if (!env.van) {
    // on client side call registerEnv({ van: vanServer.default }) to render as string
    if (isServer) {
      registerEnv({ van: vanServer.default })
    } else {
      registerEnv({ van })
    }
  }

  // if registerEnv as vanServer (on client side), then it has "html" property
  const renderAsString = isServer || env.van.html !== undefined;

  if (typeof jsxTag === "string") {
    const ns = namespaceElements[jsxTag];

    const newElement = (ns ? env.van.tags(ns) : env.van.tags)[jsxTag](props, children);

    // Handle style reactively
    env.van.derive(() => {
      if (style) {
        const styleProp = typeof style === "function" ? style() : style;
        const styleValue = styleToString(styleProp);
        if (renderAsString) {
          newElement.propsStr += ` style="${styleValue}"`;
        } else {
          newElement.style.cssText = styleValue;
        }
      }
    });

    // On server, apply props as string
    if (renderAsString) {
      return newElement;
    }

    // On client, apply attributes reactively
    for (const [k, value] of Object.entries(props)) {
      // Use element's namespace for attributes
      const attrNamespace = k === "xmlns" ? null : newElement.namespaceURI;

      if (typeof value === "function" && !k.startsWith("on")) {
        env.van.derive(() => setAttributeNS(attrNamespace, newElement, k, value()));
        continue;
      }

      if (typeof value === "function" && k.startsWith("on")) {
        newElement.addEventListener(k.slice(2).toLowerCase(), value);
        continue;
      }

      if (typeof value === "object" && "val" in value) {
        env.van.derive(() =>
          setAttributeNS(attrNamespace, newElement, k, value.val)
        );
        continue;
      }

      setAttributeNS(attrNamespace, newElement, k, value);
    }

    if (ref) ref.val = { current: newElement };

    return newElement;
  }

  return typeof jsxTag === "function"
    ? jsxTag({ children, ref, style, ...props })
    : /* istanbul ignore next */ null;
};
