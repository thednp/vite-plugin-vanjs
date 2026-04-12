import van from "@vanjs/van";
import { hydrate } from "@vanjs/client";
import { Head, initializeHeadTags } from "@vanjs/meta";
import { routerState, setRouterState } from "./state.ts";
import { isServer } from "../setup/isServer.ts";
import { matchRoute } from "./matchRoute.ts";
import { executeLifecycle } from "./helpers.ts";
import { unwrap } from "./unwrap.ts";

let _initialized = false;

const initClient = () => {
  if (_initialized) return;

  initializeHeadTags();
  globalThis.addEventListener(
    "popstate",
    (e: Event) => {
      const location = (e.target as typeof globalThis).location;
      const oldPath = routerState.pathname.oldVal;
      if (location.pathname !== oldPath) {
        setRouterState(location.pathname, location.search);
      }
    },
  );
  _initialized = true;
};

export const Router = (initialProps: Record<string, unknown> = {}) => {
  const { div, main } = van.tags;

  const props = Object.fromEntries(
    Object.entries(initialProps).filter(([, val]) => val !== undefined),
  );
  const wrapper = main({ ...props, "data-root": true });

  if (!isServer) initClient();

  const route = matchRoute(routerState.pathname.val);
  if (!route) return van.add(wrapper, div("No Route Found"));

  routerState.params.val = route.params || {};

  if (isServer) {
    return (async () => {
      try {
        const module = await route.component();
        await executeLifecycle(module, route.params);
        return van.add(
          wrapper,
          ...(unwrap(module.component).children as never[]),
        );
      } catch (error) {
        console.error("Router error:", error);
        return van.add(wrapper, div("Error loading page"));
      }
    })();
  }

  if (document.querySelector("[data-root]")) {
    // const module = route.component();
    // executeLifecycle(module, route.params);
    // if (document.head) {
    //   van.hydrate(document.head, (head) => hydrate(head as never, Head() as never[]));
    // }
    // return van.add(wrapper, ...(unwrap(module.component).children as never[]));
    const moduleReturn = async () => {
      const module = await route.component();
      await executeLifecycle(module, route.params);
      const children = unwrap(module.component).children;

      if (document.head) {
        van.hydrate(document.head, (head) => hydrate(head, Head()));
      }

      return van.add(wrapper, ...children as never[]);
    };
    return moduleReturn();
  }

  van.derive(() => {
    const route = matchRoute(routerState.pathname.val);
    if (!route) {
      wrapper.replaceChildren(div("No Route Found"));
      return;
    }
    const moduleReturn = async () => {
      const module = await route.component();
      await executeLifecycle(module, route.params);
      const children = unwrap(module.component).children;

      // wrapper.replaceChildren(...(children as never[]));
      if (document.head) {
        van.hydrate(document.head, (head) => hydrate(head, Head()));
      }

      return van.add(wrapper, ...children as never[]);
    };
    moduleReturn();
  });

  return wrapper;
};
