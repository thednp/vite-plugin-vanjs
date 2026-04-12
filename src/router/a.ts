import van from "@vanjs/van";
import { matchRoute } from "./matchRoute.ts";
import {
  executeLifecycle,
  isCurrentLocation,
  isCurrentPage,
  navigate,
} from "./helpers.ts";
import type {
  DOMNodeAttributes,
  MaybeChildNode,
  OutputElement,
} from "../types/types.d.ts";

type AnchorProps = DOMNodeAttributes<"a">;

export const A = (
  /* istanbul ignore next */ { href, children, ...rest }: AnchorProps = {},
  ...otherChildren: MaybeChildNode[]
): OutputElement<"a"> => {
  /* istanbul ignore next - try again later */
  const props = Object.fromEntries(
    Object.entries(rest || {}).filter(([_, val]) => val !== undefined),
  ) as Omit<AnchorProps, "children" | "href">;

  const newProps = {
    href,
    ...props,
    onclick: async (e: PointerEvent) => {
      e.preventDefault();
      const HREF = typeof href === "function"
        ? href()
        : typeof href === "object"
        ? href.val
        : href as string;

      /* istanbul ignore next */
      if (isCurrentPage(HREF)) return;

      // istanbul ignore else
      if (props.onclick) {
        (props.onclick as (e: Event) => void)(e);
      }

      const route = matchRoute(HREF);
      const module = await route?.component();
      if (route && module) {
        await executeLifecycle(module, route.params);

        navigate(HREF);
      }
    },
    onmouseenter: () => {
      const HREF = (typeof href === "function" ? href() : href) as string;
      const route = matchRoute(HREF);

      /* istanbul ignore else */
      if (route?.component) {
        route.component();
      }
    },
  };

  van.derive(() => {
    const HREF = typeof href === "function"
      ? href()
      : typeof href === "object"
      ? href.val
      : href as string;

    const isPage = isCurrentPage(HREF);
    const isLocation = isCurrentLocation(HREF);

    if (isPage || isLocation) {
      newProps.ariaCurrent = isPage ? "page" : "location";
    }
  });

  return van.tags.a(newProps as never, (children || otherChildren) as never);
};
