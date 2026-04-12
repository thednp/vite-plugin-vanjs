import van from "@vanjs/van";
import { isServer } from "../setup/isServer.ts";

/**
 * Fixes the URL of a route.
 * @param url
 */
export function fixRouteUrl(url?: string): string {
  if (!url) return "/";
  if (url.startsWith("/")) {
    return url;
  }
  return `/${url}`;
}

const initialPath = !isServer ? globalThis.location.pathname : "/";
const initialSearch = !isServer ? globalThis.location.search : "";

export const routerState = {
  pathname: van.state(initialPath),
  searchParams: van.state(new URLSearchParams(initialSearch)),
  params: van.state<Record<string, string>>({}),
};

/**
 * Sets the router state to the specified href.
 * @param href the URL to navigate to
 * @param search the search string
 * @param params the route params object
 */
export function setRouterState(
  path: string,
  search?: string,
  params?: Record<string, string>,
): void {
  const [pathname, searchParams] = fixRouteUrl(path).split("?");
  routerState.pathname.val = pathname;
  routerState.searchParams.val = new URLSearchParams(
    search || searchParams || "",
  );
  routerState.params.val = params || {};
}
