import van from "vanjs-core";
import setup from "@vanjs/setup";
import { routerState } from "./state";
import { matchRoute } from "./routes";
import { executeLifecycle, unwrap } from "./helpers";

export const Router = () => {
  const { div } = van.tags;
  // const meta = defaultMeta();

  const mainLayout = () => {
    const route = matchRoute(routerState.pathname.val);
    /* istanbul ignore else */
    if (!route) return div("404 - Not Found");

    routerState.params.val = route.params || {};
    // Server-side or async component: use renderComponent
    if (setup.isServer) {
      const renderComponent = async () => {
        try {
          const module = await route.component();
          const component = module.component();
          await executeLifecycle(module, route.params);
          return unwrap(component).children;
        } catch (error) {
          /* istanbul ignore next */
          console.error("Router error:", error);
          /* istanbul ignore next */
          return div("Error loading page");
        }
      };

      return renderComponent();
    }

    const module = route.component();
    // Client-side lazy component, lifeCycle is already executed on the server
    // or when A component has been clicked in the client
    return unwrap(module.component);
  };

  return mainLayout();
};
