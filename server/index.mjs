import { basename } from "node:path";
// import { routerState } from "../router/index.mjs";
import * as dataCache from "../router/dataCache.mjs";
export * from "../plugin/helpers.mjs";

/**
 * @type {typeof import("./types.d.ts").renderToString}
 */
export const renderToString = async (inputSource) => {
  const source = typeof inputSource === "function"
    ? inputSource()
    : inputSource;

  if (typeof source === "number") {
    return String(source);
  }
  if (typeof source === "string") {
    return source.trim();
  }
  if (typeof source === "boolean") {
    return String(source);
  }
  if (typeof source === "object" && "render" in source) {
    return source.render();
  }
  if (source instanceof Promise) {
    return renderToString(await source);
  }
  /* istanbul ignore else */
  if (Array.isArray(source)) {
    const elements = [];
    for (const el of source) {
      elements.push(await renderToString(el));
    }
    return elements.join("");
  }

  // return String(source)
  // no source provided
  // @ts-ignore - this is server side code
  console.warn("Render error! Source not recognized: " + source);
  return "";
};

/**
 * @param {string} file
 * @returns {string}
 */
// return `<link rel="preload" href="${file}" as="style" crossorigin>`;
function renderPreloadLink(file) {
  if (file.endsWith(".js")) {
    return `<link rel="modulepreload" href="${file}" crossorigin>`;
  } else if (file.endsWith(".css")) {
    return `<link rel="stylesheet" href="${file}" crossorigin>`;
  } else if (file.endsWith(".woff")) {
    return `<link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith(".woff2")) {
    return `<link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else {
    console.warn("Render error! File format not recognized: " + file);
    return "";
  }
}

/**
 * @type {typeof import("./types.d.ts").renderPreloadLinks}
 */
export function renderPreloadLinks(modules, manifest) {
  let links = "";
  const seen = new Set();
  const ignoredAssets = new Set();

  // First pass: collect all assets from ignored paths
  Object.entries(manifest).forEach(([id, files]) => {
    // istanbul ignore else - don't pre-render routes, layouts and JSX stuff
    if (
      ["src/pages", "src/routes", "vite-plugin-vanjs/"].some((l) =>
        id.includes(l)
      )
    ) {
      files.forEach((asset) => ignoredAssets.add(asset));
    }
  });

  // Second pass: generate preload links
  modules.forEach((id) => {
    const files = manifest[id];
    // istanbul ignore else
    if (files?.length) {
      files.forEach((file) => {
        // Skip if we've seen this file or if it's an asset from an ignored path
        if (seen.has(file) || ignoredAssets.has(file)) return;
        seen.add(file);
        const filename = basename(file);

        // Handle dependencies
        // istanbul ignore next - no way to test this
        if (manifest[filename]) {
          for (const depFile of manifest[filename]) {
            // istanbul ignore else
            if (!seen.has(depFile) && !ignoredAssets.has(depFile)) {
              links += renderPreloadLink(depFile);
              seen.add(depFile);
            }
          }
        }
        links += renderPreloadLink(file);
      });
    }
  });

  return links;
}

/**
 * Serialize route data for client hydration.
 * Uses the new __DATA_CACHE format with path-keyed cache entries.
 * @returns {string}
 */
export const getDataPreload = () => {
  const cacheJSON = dataCache.toJSON();
  const cacheEntries = Object.keys(cacheJSON);

  if (cacheEntries.length > 0) {
    const json = JSON.stringify(cacheJSON);
    return `<script id="data-cache">window.__DATA_CACHE=${json};</script>`;
  }
  return "";
};
