// router/a.mjs
import van from "vanjs-core";
import setup from "../setup/index";
import { matchRoute } from "./routes";
import { executeLifecycle, isCurrentPage, navigate } from "./helpers";

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
  if (!setup.isServer) {
    anchor.addEventListener("click", async (e) => {
      e.preventDefault();
      if (isCurrentPage(href)) return;

      const route = matchRoute(href);
      const module = await route.component();
      await executeLifecycle(module, route.params);
      // console.log('A.click', route)

      navigate(href);
    });

    anchor.addEventListener("mouseenter", async () => {
      const route = matchRoute(href);

      if (route?.component) {
        route.component();
      }
    });
  }
  return anchor;
};
