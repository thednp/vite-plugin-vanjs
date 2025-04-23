// setup/van.mjs
import van from "vanjs-core";

// Create our own tag function that wraps the original
function tagWithHydration(ns, name, ...args) {
  // Get the correct tag function based on namespace
  const originalTag = ns ? van.tags(ns)[name] : van.tags[name];

  let [{ is: _is, ...props }, ...children] =
    Object.getPrototypeOf(args[0] ?? 0) === Object.prototype
      ? args
      : [{}, ...args];

  // Add data-hk if element needs hydration
  if (
    props && (
      Object.keys(props).some((k) => k.startsWith("on")) || // has events
      Object.values(props).some((v) =>
        v && typeof v === "object" && "val" in v
      ) || // has state
      typeof args[0] === "function" // is component
    )
  ) {
    props = { ...props, "data-hk": "" };
  }

  // Call the original tag function
  return originalTag(props, ...children);
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
