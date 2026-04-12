import type { RouteEntry } from "./types.d.ts";
import { extractParams } from "./extractParams.ts";
import { routes } from "vite-plugin-vanjs/router-routes";

/**
 * Find a registered route that matches the given path
 */
export function matchRoute(initialPath: string): RouteEntry | null {
  const path = initialPath !== "/" && initialPath.endsWith("/")
    ? initialPath.slice(0, -1)
    : initialPath;

  let foundMatch = routes.find((r) => r.path === path && !r.path.includes("*"));

  if (!foundMatch) {
    const nestedPath = path.split("/").slice(0, -1).join("/") + "/*";
    foundMatch = routes.find((r) => r.path === nestedPath);
  }

  if (foundMatch) {
    return {
      ...foundMatch,
      params: extractParams(foundMatch.path, path) ?? undefined,
    } as RouteEntry;
  }

  for (const route of routes) {
    if (route.path === "*") continue;
    const params = extractParams(route.path, path);

    if (params) {
      return { ...route, params } as RouteEntry;
    }
  }

  return routes.find((r) => r.path === "*") as RouteEntry || null;
}
