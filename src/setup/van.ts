import van from "vanjs-core";
import { needsHydration } from "./helpers.ts";

function tagWithHydration(
  ns: string | undefined,
  name: string,
  ...args: unknown[]
): unknown {
  const originalTag = ns ? van.tags(ns)[name] : van.tags[name];

  const [props, ...children] =
    Object.getPrototypeOf(args[0] ?? 0) === Object.prototype
      ? args
      : [{}, ...args];

  const finalProps: Record<string, unknown> = { ...(props as object) };

  if (needsHydration(props as Record<string, unknown>)) {
    finalProps["data-hk"] = "";
  }

  return originalTag(finalProps as never, ...(children as never[]));
}

function createTagsProxy() {
  return new Proxy(
    (ns?: string) =>
      new Proxy(tagWithHydration.bind(undefined, ns) as never, {
        get: (_, name) => tagWithHydration.bind(undefined, ns, name as string),
      }),
    {
      get: (_, name) =>
        tagWithHydration.bind(undefined, undefined, name as string),
    },
  );
}

const vanClient = {
  ...van,
  tags: createTagsProxy() as unknown as typeof van.tags,
};

export default vanClient;
