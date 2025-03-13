import van from "vanjs-core";
import setup from "../setup/index.mjs";
import { routerState } from "./state.mjs";
import { matchRoute } from "./routes.mjs";
import { executeLifecycle, unwrap } from "./helpers.mjs";

export const Router = (props) => {
  const { div, main } = van.tags;
  const wrapper = main(props);
  const mainLayout = () => {
    const route = matchRoute(routerState.pathname.val);
    /* istanbul ignore else */
    if (!route) return van.add(wrapper, div("404 - Not Found"));

    routerState.params.val = route.params || {};
    // Server-side or async component: use renderComponent
    if (setup.isServer) {
      const renderComponent = async () => {
        try {
          const module = await route.component();
          const component = module.component();

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

    // Client-side lazy component, lifeCycle is already executed on the server
    // or when A component has been clicked in the client
    const module = route.component();
    const children = module.component
      ? Array.from(unwrap(module.component).children)
      : [];
    return children.length ? van.add(wrapper, ...children) : wrapper;
  };

  return mainLayout();
};
