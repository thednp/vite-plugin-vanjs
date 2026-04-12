import van from "vanjs-core";
import type { PropsWithKnownKeys } from "vanjs-core";
import { addMeta } from "./Head.ts";

export function Title(
  props: PropsWithKnownKeys<HTMLTitleElement>,
  content?: string,
): null {
  const { title } = van.tags;
  addMeta(title(props, content));
  return null;
}

export function Meta(
  props: PropsWithKnownKeys<HTMLMetaElement> & { charset?: string },
): null {
  const { meta } = van.tags;
  addMeta(meta(props));
  return null;
}
