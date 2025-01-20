import setup from "@vanjs/setup";
import { getTagKey } from "./helpers";

/** @typedef {import("./types.d.ts").GetTags} GetTags */
/** @typedef {import("./types.d.ts").CreateTags} CreateTags */
/** @typedef {import("./types.d.ts").ResetTags} ResetTags */
/** @typedef {import("./types.d.ts").InitializeTags} InitializeTags */
/** @typedef {import("./types.d.ts").AddMeta} AddMeta */
/** @typedef {import("./types.d.ts").HeadComp} HeadComp */

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
export const initializeHeadTags = () => {
  const tags = getHeadTags();
  if (!tags.size && !setup.isServer) {
    [...document.head.children].forEach((tag) => {
      tags.set(getTagKey(tag), tag);
    });
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
