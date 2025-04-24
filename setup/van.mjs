// setup/van.mjs
import van from "vanjs-core";
import { needsHydration } from "./helpers.mjs";

// Create our own tag function that wraps the original
function tagWithHydration(ns, name, ...args) {
  // Get the correct tag function based on namespace
  const originalTag = ns ? van.tags(ns)[name] : van.tags[name];

  const [props, ...children] =
    Object.getPrototypeOf(args[0] ?? 0) === Object.prototype
      ? args
      : [{}, ...args];

  // Create new props object without event handlers
  const finalProps = { ...props };

  // Add data-hk if element needs hydration
  if (needsHydration(props)) {
    finalProps["data-hk"] = "";
  }

  // Call the original tag function
  return originalTag(finalProps, ...children);
}

// Create our tags proxy using the same pattern as vanjs-core
const tagsProxy = new Proxy(
  (ns) =>
    new Proxy(tagWithHydration.bind(undefined, ns), {
      get: (_, name) => tagWithHydration.bind(undefined, ns, name),
    }),
  {
    get: (_, name) => tagWithHydration.bind(undefined, undefined, name),
  },
);

// Export modified van instance with only tags overridden
const vanClient = {
  ...van,
  tags: tagsProxy,
};

export default vanClient;
