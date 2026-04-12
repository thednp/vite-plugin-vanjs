import { isServer } from "../setup/isServer.ts";
import { routerState, setRouterState } from "./state.ts";
import { matchRoute } from "./matchRoute.ts";
import type { ComponentModule } from "./types.d.ts";

export function isCurrentPage(pageName: string): boolean {
  return routerState.pathname.val === pageName;
}

export const isCurrentLocation = (pageName: string) => {
  const pathName = routerState.pathname.val;
  return pathName !== "/" && pathName.includes(pageName);
};

export function isLazyComponent(
  component: unknown,
): component is () => Promise<unknown> {
  if (isServer && typeof component === "function") {
    return component.constructor.name.includes("AsyncFunction");
  }

  return (component as Record<string, unknown>)?.isLazy === true;
}

/**
 * Execute lifecycle methods preload and / or load
 */
export const executeLifecycle = async (
  module: ComponentModule | Promise<ComponentModule>,
  params?: Record<string, string>,
): Promise<boolean> => {
  const { route } = module instanceof Promise ? await module : module;
  if (!route) return true;
  try {
    if (route?.preload) await route.preload(params);
    if (route?.load) await route.load(params);
    return true;
  } catch (error) {
    console.error("Lifecycle execution error:", error);
    return false;
  }
};

/**
 * Navigates to the specified href in the client and sets the router state.
 * Keep in mind that the router handles the search params and hash.
 *
 * @param href the URL to navigate to
 * @param options when true, will replace the current history entry
 */
export function navigate(
  path: string,
  options: { replace?: boolean } = {},
): void {
  const { replace = false } = options;

  if (!isServer) {
    const url = new URL(path, globalThis.location.origin);
    const route = matchRoute(url.pathname);

    if (replace) {
      globalThis.history.replaceState({}, "", path);
    } else {
      globalThis.history.pushState({}, "", path);
    }

    setRouterState(url.pathname, url.search, route?.params);
  } else {
    console.error("Direct navigation is not supported on server");
  }
}

/**
 * A client only helper function that reloads the current page.
 */
// export const reload: () => void;

/**
 * A helper function that redirects the user to the specified href.
 * When called in the server, it will return a function that will redirect the user
 * to the specified href when called.
 * @param {string | undefined} href the URL to redirect to
 */
// export const redirect: (href?: string) => void | (() => void);
