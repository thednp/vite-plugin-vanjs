// router/a.mjs
import van from "vanjs-core";
import setup from "../setup/index.mjs";
import { matchRoute } from "./routes.mjs";
import { executeLifecycle, isCurrentPage, navigate } from "./helpers.mjs";

/** @typedef {typeof import("./types").A} A */

/**
 * @type {A}
 */
export const A = (
  /* istanbul ignore next */ { href, children, ...rest } = {},
  ...otherChildren
) => {
  /* istanbul ignore next - try again later */
  const props = Object.fromEntries(
    Object.entries(rest || {}).filter(([_, val]) => val),
  );
  const newProps = {
    href,
    ...props,
  };

  van.derive(() => {
    if (isCurrentPage(href)) {
      newProps["aria-current"] = "page";
    }
  });

  const anchor = van.tags.a(newProps, [...(children || []), ...otherChildren]);
  /* istanbul ignore else */
  if (!setup.isServer) {
    anchor.addEventListener("click", async (e) => {
      e.preventDefault();
      /* istanbul ignore next */
      if (isCurrentPage(href)) return;

      const route = matchRoute(href);
      const module = await route.component();
      await executeLifecycle(module, route.params);

      navigate(href);
    });

    anchor.addEventListener("mouseenter", () => {
      const route = matchRoute(href);

      /* istanbul ignore else */
      if (route?.component) {
        route.component();
      }
    });
  }
  return anchor;
};
