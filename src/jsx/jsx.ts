import van from "@vanjs/van";
import type { State } from "vanjs-core";
import { setAttributeNS, styleToString } from "@vanjs/client";
import { isServer } from "../setup/isServer.ts";
import { namespaceElements } from "./ns.ts";
import type {
  TagNames,
  Component,
  ComponentProps,
  OutputElement,
  ElementUnion,
} from "../types/types.d.ts";

export const Fragment = (
  { children }: { children: ElementUnion },
): ElementUnion => children;

export function jsx<K extends TagNames = "main">(
  jsxTag: TagNames | Component<K>,
  { children, ref, ...rest }: ComponentProps<K>,
): OutputElement<K> | null {
  const props = Object.fromEntries(
    Object.entries(rest).filter(([, val]) => val !== undefined),
  );

  if (typeof jsxTag === "string") {
    const ns = namespaceElements[jsxTag];
    const newElement = (ns ? van.tags(ns) : van.tags)[jsxTag](
      props as never,
      children as never,
    ) as OutputElement<K>;

    if (isServer) {
      return newElement;
    }

    for (const [k, value] of Object.entries(props)) {
      const attrNamespace = k === "xmlns"
        ? null
        : newElement.namespaceURI;

      if (k === "style") {
        van.derive(() => {
          const styleValue = styleToString(value );
          if (isServer) {
            (newElement as unknown as { propsStr: string }).propsStr +=
              ` style="${styleValue}"`;
          } else {
            (newElement as HTMLElement).style.cssText = styleValue;
          }
        });
        continue;
      }

      if (typeof value === "function" && !k.startsWith("on")) {
        van.derive(() =>
          setAttributeNS(
            attrNamespace,
            newElement as Element,
            k,
            (value as () => unknown)() as string | boolean | null | undefined,
          )
        );
        continue;
      }

      if (typeof value === "function" && k.startsWith("on")) {
        newElement.addEventListener(
          k.slice(2).toLowerCase(),
          value as EventListener,
        );
        continue;
      }

      if (typeof value === "object" && value !== null && "val" in value) {
        van.derive(() =>
          setAttributeNS(
            attrNamespace,
            newElement as Element,
            k,
            (value as State<unknown>).val as never,
          )
        );
        continue;
      }

      setAttributeNS(attrNamespace, newElement, k, value as never);
    }

    if (ref) ref.val = { current: newElement };

    return newElement;
  }

  return typeof jsxTag === "function"
    ? jsxTag({ children, ref, ...props } as ComponentProps<K>) as OutputElement<K>
    : null;
}
