import van from "vanjs-core";
import setup from "../setup/index.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./routes.mjs";
import { executeLifecycle, unwrap } from "./helpers.mjs";
import { hydrate } from "../client/index.mjs";
import { Head, initializeHeadTags } from "@vanjs/meta";

let isConnected = false;
/** @param {Event & {target: globalThis}} e */
// istanbul ignore next - cannot test
const popHandler = (e) => {
  const location = e.target.location;
  const oldPath = routerState.pathname._oldVal;
  // istanbul ignore next - cannot test
  if (location.pathname !== oldPath) {
    setRouterState(location.pathname, location.search);
  }
}

export const Router = (initialProps = /* istanbul ignore next */ {}) => {
  const { div, main } = van.tags;

  /* istanbul ignore next - try again later */
  const props = Object.fromEntries(
    Object.entries(initialProps).filter(([_, val]) => val !== undefined),
  );
  const wrapper = main({ ...props, "data-root": true });
  const mainLayout = () => {
    const route = matchRoute(routerState.pathname.val)
    /* istanbul ignore else */
    if (!route) return van.add(wrapper, div("404 - Not Found"));

    routerState.params.val = route.params || {};
    // Server-side or async component: use renderComponent
    if (setup.isServer) {
      const renderComponent = async () => {
        try {
          const module = await route.component();
          const component = typeof module.component === "function" ? module.component() : /* istanbul ignore next */module.component;

          await executeLifecycle(module, route.params);
          return van.add(wrapper, unwrap(component).children);
        } catch (error) {
          /* istanbul ignore next */
          console.error("Router error:", error);
          /* istanbul ignore next */
          return van.add(wrapper, div("Error loading page"));
        }
      };

      return renderComponent();
    }

    const root = document.querySelector("[data-root]");
    // istanbul ignore else - cannot test unmount
    if (isConnected || !root) {
      initializeHeadTags();
      window.addEventListener("popstate", popHandler);
    } else {
      window.removeEventListener("popstate", popHandler);
    }

    // Client-side lazy component, lifeCycle is already executed on the server
    // or when A component has been clicked in the client
    if (root) {
      // this case is when root is server side rendered
      const module = route.component();
      const children = () => {
        // istanbul ignore next - cannot test
        const cp = (Array.isArray(module) || module instanceof Element) ? module
          : typeof module.component === "function"
            ? module.component()
            : module.component;
        // istanbul ignore next - cannot test
        const kids = () => cp
          ? Array.from(unwrap(cp).children)
          : []
        const kudos = kids();

        // istanbul ignore else
        if (document.head) {
          isConnected = true;
          van.hydrate(document.head, head => hydrate(head, Head()));
        }

        return kudos;
      };

      return van.add(wrapper, ...children());
    }
    // this case is when root is for SPA apps
    const csrRoute = van.derive(() => {
      const p = routerState.pathname.val;
      return matchRoute(p);
    })

    const children = van.derive(() => {
      const md = csrRoute.val.component();
      // istanbul ignore next - cannot test all cases
      const cp = (Array.isArray(md) || md instanceof Element) ? md
        : typeof md.component === "function"
          ? md.component()
          : md.component;
      return cp
        ? Array.from(unwrap(cp).children)
        : /* istanbul ignore next */[]
    });

    const component = () => {
      const kids = () => children.val;
      const result = () => {
        return van.derive(() => van.hydrate(wrapper, (el) => {
          const kudos = kids();
          isConnected = true;
          // istanbul ignore else
          if (document.head) {
            van.hydrate(document.head, head => hydrate(head, Head()));
          }
          return hydrate(el, kudos);
        })).val;
      }
      return result();
    }
    const finalResult = component();
    return finalResult ? /* istanbul ignore next*/ van.add(wrapper, finalResult) : wrapper;
  };

  return mainLayout();
};
