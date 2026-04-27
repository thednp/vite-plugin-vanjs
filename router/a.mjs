// router/a.mjs
import van from "vanjs-core";
import { matchRoute } from "./matchRoute.mjs";
import {
  getValue,
  isCurrentLocation,
  isCurrentPage,
  navigate,
} from "./helpers.mjs";

/** @typedef {typeof import("./types").A} A */

/**
 * @type {A}
 */
export const A = (
  /* istanbul ignore next */
  { href, children, ...rest } = {},
  ...otherChildren
) => {
  /* istanbul ignore next - try again later */
  const props = Object.fromEntries(
    Object.entries(rest || {}).filter(([_, val]) => val !== undefined),
  );

  const preloaded = van.state(false);

  const newProps = {
    href,
    ...props,
    onclick: async (e) => {
      const HREF = getValue(href);
      e.preventDefault();
      /* istanbul ignore next */
      if (isCurrentPage(HREF)) return;

      // istanbul ignore else
      if (typeof props.onclick === "function") {
        await props.onclick(e);
      }

      navigate(HREF);
    },
    onmouseenter: async () => {
      const HREF = getValue(href);
      const route = matchRoute(HREF);

      // istanbul ignore else
      if (typeof props.onmouseenter === "function") {
        await props.onmouseenter(e);
      }
      /* istanbul ignore else */
      if (route?.component && !preloaded.val) {
        route.component();
        preloaded.val = true;
      }
    },
  };

  newProps["aria-current"] = van.derive(() => {
    const isPage = isCurrentPage(href);
    const isLocation = isCurrentLocation(href);
    return isPage ? "page" : isLocation ? "location" : null;
  });

  return van.tags.a(newProps, children || otherChildren);
};
