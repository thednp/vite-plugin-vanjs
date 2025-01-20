import van from "vanjs-core";
import { addMeta } from "./Head";

/** @typedef {import("./types.d.ts").TagProps} TagProps */

/**
 * Add a new title tag
 * @type {(content: string) => null}
 */
export const Title = (content) => {
  const { title } = van.tags;
  addMeta(title(content));
  return null;
};

/**
 * Add a new meta tag
 * @type {(props: TagProps) => null}
 */
export const Meta = (props) => {
  const { meta } = van.tags;
  addMeta(meta(props));
  return null;
};

/**
 * Add a new link tag
 * @type {(props: TagProps) => null}
 */
export const Link = (props) => {
  const { link } = van.tags;
  addMeta(link(props));
  return null;
};

/**
 * Add a new script tag
 * @type {(props: TagProps) => null}
 */
export const Script = (props) => {
  const { script } = van.tags;
  addMeta(script(props));
  return null;
};

/**
 * Add a new style tag
 * @type {(props: TagProps) => null}
 */
export const Style = (props, content) => {
  const { style } = van.tags;
  addMeta(style(props, content));
  return null;
};
