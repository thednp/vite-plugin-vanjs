import van from "vanjs-core";
import setup from "../setup/index.mjs";
import { routerState, setRouterState } from "./state.mjs";
import { matchRoute } from "./routes.mjs";
import { executeLifecycle, unwrap } from "./helpers.mjs";
import { hydrate } from "../client/index.mjs";

/** @param {Event & {target: globalThis}} e */
const popHandler = (e) => {
  // istanbul ignore next - cannot test
  setRouterState(e.target.location.pathname, e.target.location.search);
}

export const Router = (initialProps = /* istanbul ignore next */ {}) => {
  const { div, main } = van.tags;
  /* istanbul ignore next - try again later */
  const props = Object.fromEntries(
    Object.entries(initialProps).filter(([_, val]) => val !== undefined),
  );
  const isConnected = van.state(false);
  const route = van.derive(() => {
    const pathname = routerState.pathname.val;
    return matchRoute(pathname);
  })
  const wrapper = main(props);
  
  const mainLayout = () => {
    /* istanbul ignore else */
    if (!route.val) return van.add(wrapper, div("404 - Not Found"));

    routerState.params.val = route.val.params || {};
    // Server-side or async component: use renderComponent
    if (setup.isServer) {
      const renderComponent = async () => {
        try {
          const module = await route.val.component();
          const component = module.component();

          await executeLifecycle(module, route.val.params);
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

    // Client-side lazy component, lifeCycle is already executed on the server
    // or when A component has been clicked in the client
    const children = van.derive(() => {
      const module = route.val.component();
      return module.component
          ? Array.from(unwrap(module.component).children)
          : /* istanbul ignore next */[];
    });

    van.derive(() => {
      const con = isConnected.val;
      if (con) {
        window.addEventListener("popstate", popHandler);
      } else {
        window.removeEventListener("popstate", popHandler);
      }
    })

    van.derive(() => {
      const els = children.val;
      isConnected.val = true;
      hydrate(wrapper, els);
    });

    return wrapper;
  };

  return mainLayout();
};
