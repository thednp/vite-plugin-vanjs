// setup/van-ssr.mjs
import { registerEnv } from "mini-van-plate/shared";
import van from "mini-van-plate/van-plate";

function tagWithHydration(ns, name, ...args) {
  // Get original tag function
  const originalTag = ns ? van.tags(ns)[name] : van.tags[name];
  let [props, ...children] =
    Object.getPrototypeOf(args[0] ?? /* istanbul ignore next */ 0) ===
        Object.prototype
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

  // Call the original tag function directly
  return originalTag(props, ...children);
}

const tagsProxy = new Proxy(
  (ns) =>
    new Proxy(tagWithHydration.bind(undefined, ns), {
      get: (_, name) => tagWithHydration.bind(undefined, ns, name),
    }),
  {
    get: (_, name) => tagWithHydration.bind(undefined, undefined, name),
  },
);

const vanSSR = {
  ...van,
  tags: tagsProxy,
};

registerEnv({ van: vanSSR });

export default vanSSR;
