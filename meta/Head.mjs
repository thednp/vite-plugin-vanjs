import setup from "@vanjs/setup";
import { getTagKey } from "./helpers.mjs";

/** @typedef {typeof import("./types.d.ts").getHeadTags} GetTags */
/** @typedef {typeof import("./types.d.ts").createHeadTags} CreateTags */
/** @typedef {typeof import("./types.d.ts").resetHeadTags} ResetTags */
/** @typedef {typeof import("./types.d.ts").initializeHeadTags} InitializeTags */
/** @typedef {typeof import("./types.d.ts").addMeta} AddMeta */
/** @typedef {typeof import("./types.d.ts").Head} HeadComp */

/**
 * Create a new Map for each request on server
 * @type {CreateTags}
 */
const createHeadTags = () => new Map();

/**
 * Get the current head tags. Use a factory pattern to get the right store
 * on the server and the client.
 * @type {GetTags}
 */
const getHeadTags = (() => {
  if (setup.isServer) {
    // On server, create one Map per request scope
    let serverHeadTags;
    return () => {
      if (!serverHeadTags) {
        serverHeadTags = createHeadTags();
      }
      return serverHeadTags;
    };
  }
  // On client, use a singleton
  const clientHeadTags = createHeadTags();
  return () => clientHeadTags;
})();

/**
 * Clear all head tags
 * @type {ResetTags}
 */
export const resetHeadTags = () => {
  const tags = getHeadTags();
  tags.clear();
};

/**
 * Initialize the head tags
 * @type {InitializeTags}
 */
export const initializeHeadTags = (html) => {
  const tags = getHeadTags();
  /* istanbul ignore else */
  if (!tags.size && !setup.isServer) {
    [...document.head.children].forEach((tag) => {
      tags.set(getTagKey(tag), tag);
    });
  } else if (setup.isServer) {
    resetHeadTags();
    return async () => {
      const { extractTags } = await import("./helpers.mjs");
      const serverTags = await extractTags(html);
      serverTags.forEach(({ tag, props, content }) => {
        tag(content || props);
      });
    };
  }
};

/**
 * Add a new meta tag
 * @type {AddMeta}
 */
export const addMeta = (tag) => {
  if (!tag) return;
  const tags = getHeadTags();
  const key = getTagKey(tag);
  tags.set(key, tag);
};

/**
 * Get the head tags
 * @type {HeadComp}
 */
export const Head = () => {
  return () => {
    const tags = getHeadTags();
    return Array.from(tags.values());
  };
};
