import { basename } from "node:path";

/**
 * @type {typeof import("./types.d.ts").renderToString}
 */
export const renderToString = async (source) => {
  if (typeof source === "number") {
    return String(source);
  }
  if (typeof source === "string") {
    return source.trim();
  }
  if (typeof source === "function") {
    return await renderToString(source());
  }
  if (typeof source === "object" && "render" in source) {
    return source.render();
  }
  if (source instanceof Promise) {
    return await renderToString(await source);
  }
  if (Array.isArray(source)) {
    const elements = [];
    for (const el of source) {
      elements.push(await renderToString(el));
    }
    return elements.join("");
  }

  // no source provided
  // @ts-ignore - this is server side code
  console.warn("Render error: source not recognized: " + source);
  return "";
};

/**
 * @param {string | undefined} file 
 * @returns {string}
 */
function renderPreloadLink(file) {
  if (file.endsWith(".js")) {
    return `<link rel="modulepreload" as="script" crossorigin href="${file}">`;
  } else if (file.endsWith(".css")) {
    return `<link rel="stylesheet" href="${file}">`;
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
    console.warn("Render error: file not recognized: " + file);
    return "";
  }
}

/**
 * @type {typeof import("./types.d.ts").renderPreloadLinks}
 */
export function renderPreloadLinks(modules, manifest) {
  let links = "";
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files?.length) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          const filename = basename(file);
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile);
              seen.add(depFile);
            }
          }
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}
