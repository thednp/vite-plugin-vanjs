import { basename } from "node:path";
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
function renderPreloadLink(file) {
  if (file.endsWith(".js")) {
    return `<link rel="preload" href="${file}" as="script" crossorigin>`;
  } else if (file.endsWith(".css")) {
    return `<link rel="preload" href="${file}" as="style" crossorigin>`;
  } else if (file.endsWith(".woff")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith(".woff2")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else if (file.endsWith(".gif")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
  } else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
  } else if (file.endsWith(".png")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
  } else if (file.endsWith(".webp")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/webp">`;
  } else {
    // @ts-ignore - this is server side code
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
