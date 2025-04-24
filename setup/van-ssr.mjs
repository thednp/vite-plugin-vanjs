// setup/van-ssr.mjs
import { registerEnv } from "mini-van-plate/shared";
import van from "mini-van-plate/van-plate";
import { needsHydration } from "./helpers.mjs";

function tagWithHydration(ns, name, ...args) {
  const originalTag = ns ? van.tags(ns)[name] : van.tags[name];

  const [props, ...children] =
    Object.getPrototypeOf(args[0] ?? /* istanbul ignore next */ 0) ===
        Object.prototype
      ? args
      : [{}, ...args];

  // Create new props object without event handlers
  const finalProps = { ...props };

  if (needsHydration(props)) {
    // Add data-hk for hydration
    finalProps["data-hk"] = "";

    // Remove all inline event handlers for server rendering
    for (const key in finalProps) {
      if (key.startsWith("on")) {
        delete finalProps[key];
      }
    }
  }

  // Use filtered props for server rendering
  return originalTag(finalProps, ...children);
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
