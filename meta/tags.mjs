import van from "vanjs-core";
import { addMeta } from "./Head.mjs";

/** @typedef {import("./types.d.ts").SupportedTags} SupportedTags */
/** @typedef {import("vanjs-core").PropsWithKnownKeys<T = SupportedTags>} PropsWithKnownKeys<T> */
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
    console.warn("Link doesn't support stylesheets, check the Wiki.");
  } else {
    addMeta(link(props));
  }
  return null;
};

/**
 * Add a new `<script>` tag, not to be used for .js files
 * Only to be used as `<script type="application/ld+json">`
 * for SEO purposes.
 * @type {(props: PropsWithKnownKeys<HTMLScriptElement>) => null}
 */
export const Script = (props) => {
  const { script } = van.tags;
  if (!props.type || props.type !== "application/ld+json") {
    console.warn("Script doesn't support this type, check the Wiki.");
  } else {
    addMeta(script(props));
  }
  return null;
};
