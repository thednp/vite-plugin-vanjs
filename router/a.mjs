// router/a.mjs
import van from "vanjs-core";
import setup from "../setup/index.mjs";
import { matchRoute } from "./routes.mjs";
import { executeLifecycle, isCurrentPage, navigate } from "./helpers.mjs";

/**
 * @param {Partial<HTMLAnchorElement>} props
 * @param  {...(Element | Node)[]} children
 * @returns {HTMLAnchorElement}
 */
export const A = (props, ...children) => {
  const { href, ...rest } = props;
  const newProps = {
    href,
    ...rest,
  };

  van.derive(() => {
    if (isCurrentPage(href)) {
      newProps["aria-current"] = "page";
    }
  });

  const anchor = van.tags.a(newProps, ...children);
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
