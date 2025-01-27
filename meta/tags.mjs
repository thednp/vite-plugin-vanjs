import van from "vanjs-core";
import { addMeta } from "./Head.mjs";

/** @typedef {import("vanjs-core").PropsWithKnownKeys} PropsWithKnownKeys */
/** @typedef {import("./types.d.ts").TagProps} TagProps */

/**
 * Add a new title tag
 * @type {(props: PropsWithKnownKeys<HTMLTitleElement>, content?: string) => null}
 */
export const Title = (props, content) => {
  const { title } = van.tags;
  addMeta(title(props, content));
  return null;
};

/**
 * Add a new meta tag
 * @type {(props: PropsWithKnownKeys<HTMLMetaElement>) => null}
 */
export const Meta = (props) => {
  const { meta } = van.tags;
  addMeta(meta(props));
  return null;
};

/**
 * Add a new link tag
 * @type {(props: PropsWithKnownKeys<HTMLLinkElement>) => null}
 */
export const Link = (props) => {
  const { link } = van.tags;
  addMeta(link(props));
  return null;
};

/**
 * Add a new script tag
 * @type {(props: PropsWithKnownKeys<HTMLScriptElement>, content?: string) => null}
 */
export const Script = (props, content) => {
  const { script } = van.tags;
  //   const realContent = content ? content.toString() : props;
  //   const realProps = content ? props : props;
  addMeta(script(props, content));
  return null;
};

/**
 * Add a new style tag
 * @type {(props: PropsWithKnownKeys<HTMLStyleElement>, content: string) => null}
 */
export const Style = (props, content) => {
  const { style } = van.tags;
  addMeta(style(props, content));
  return null;
};
