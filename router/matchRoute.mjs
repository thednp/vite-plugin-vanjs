// router/matchRoute.mjs
import { extractParams } from "./extractParams.mjs";
import { routes } from "./routes.mjs";

/** @typedef {import("./types.d.ts").RouteEntry} RouteEntry */

/**
 * Find a registered route that matches the given path
 * @param {string} initialPath
 * @returns {RouteEntry | null}
 */
export const matchRoute = (initialPath) => {
  const path = initialPath !== "/" && initialPath.endsWith("/")
    ? initialPath.slice(0, -1)
    : initialPath;

  // First try exact match (excluding wildcards)
  let foundMatch = routes.find((r) => r.path === path && !r.path.includes("*"));

  // Then try nested wildcard match if no exact match found
  if (!foundMatch) {
    // Build the path for potential nested wildcard, e.g. /admin/* for /admin/articles
    const nestedPath = path.split("/").slice(0, -1).join("/") + "/*";
    foundMatch = routes.find((r) => r.path === nestedPath);
  }

  // If we found either an exact or nested wildcard match, return it with params
  if (foundMatch) {
    return {
      ...foundMatch,
      params: extractParams(foundMatch.path, path) ?? /* istanbul ignore next */
        undefined,
    };
  }

  // Try parameterized routes (like /users/:id)
  for (const route of routes) {
    // Skip the global catch-all
    if (route.path === "*") continue;
    const params = extractParams(route.path, path);

    if (params) {
      return { ...route, params };
    }
  }

  // Finally, fallback to global catch-all route
  return routes.find((r) => r.path === "*") || null;
};
