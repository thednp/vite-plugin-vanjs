import van from "vanjs-core";
import { addMeta } from "./Head.mjs";

/** @typedef {import("vanjs-core").PropsWithKnownKeys} PropsWithKnownKeys */
/** @typedef {import("./types.d.ts").TagProps} TagProps */

/**
 * Add a new `<title>` tag
 * @type {(props: PropsWithKnownKeys<HTMLTitleElement>, content?: string) => null}
 */
export const Title = (props, content) => {
  const { title } = van.tags;
  addMeta(title(props, content));
  return null;
};

/**
 * Add a new `<meta>` tag
 * @type {(props: PropsWithKnownKeys<HTMLMetaElement>) => null}
 */
export const Meta = (props) => {
  const { meta } = van.tags;
  addMeta(meta(props));
  return null;
};

/**
 * Add a new `<link>` tag, not to be used for stylesheets
 * @type {(props: PropsWithKnownKeys<HTMLLinkElement>) => null}
 */
export const Link = (props) => {
  const { link } = van.tags;
  if (props.rel === "stylesheet") {
    console.warn("Link doesn't support stylesheets.");
  } else {
    addMeta(link(props));
  }
  return null;
};
