// router/a.mjs
import van from "vanjs-core";
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
    Object.entries(rest || {}).filter(([_, val]) => val !== undefined),
  );
  const newProps = {
    href,
    ...props,
    onclick: async (e) => {
      e.preventDefault();
      /* istanbul ignore next */
      if (isCurrentPage(href)) return;

      // istanbul ignore else
      if (props.onclick) {
        await props.onclick(e);
      }

      const route = matchRoute(href);
      const module = await route.component();
      await executeLifecycle(module, route.params);

      navigate(href);
    },
    onmouseenter: () => {
      const route = matchRoute(href);

      /* istanbul ignore else */
      if (route?.component) {
        route.component();
      }
    },
  };

  van.derive(() => {
    if (isCurrentPage(href)) {
      newProps["aria-current"] = "page";
    }
  });

  return van.tags.a(newProps, (children || otherChildren));
};
