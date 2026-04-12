import { registerEnv } from "mini-van-plate/shared";
import van from "mini-van-plate/van-plate";
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

    for (const key in finalProps) {
      if (key.startsWith("on")) {
        delete finalProps[key];
      }
    }
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

const vanSSR = {
  ...van,
  tags: createTagsProxy() as unknown as typeof van.tags,
} as typeof van;

registerEnv({ van: vanSSR });

export default vanSSR;
