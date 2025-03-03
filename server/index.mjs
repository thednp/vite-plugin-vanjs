import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { cwd } from "node:process";
import van from "vanjs-core";

/**
 * @type {typeof import("./types.d.ts").resolveFile}
 */
export const resolveFile = (file, expectedExtension) => {
  const toAbsolute = (p) => resolve(cwd(), p);
  const filePath = file.startsWith('/') ? file.slice(1) : file;
  const ext = expectedExtension
    || [".ts", ".js", ".tsx", ".jsx", ".css"].find(suffix => existsSync(toAbsolute(filePath + suffix)));
  return toAbsolute(file + ext);
}

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
  modules.forEach((id) => {
    const files = manifest[id];
    /* istanbul ignore else */
    if (files?.length) {
      files.forEach((file) => {
        /* istanbul ignore else */
        if (!seen.has(file)) {
          seen.add(file);
          const filename = basename(file);
          /* istanbul ignore next - impossible to test */
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

/**
 * @type {typeof import("./types.d.ts").vanPreloadLinks}
 */
export function vanPreloadLinks(modules, manifest) {
  // const extensions = ["js", "css", "woff", "woff2", "gif", "jpg", "jpeg", "webp"];
  const extensionProps = {
    js: { as: "stript" },
    css: { as: "style "},
    woff: { as: "font", type: "font/woff" },
    woff2: { as: "font", type: "font/woff2" },
    gif: { as: "image", type: "image/gif" },
    jpg: { as: "image", type: "image/jpeg" },
    jpeg: { as: "image", type: "image/jpeg" },
    png: { as: "image", type: "image/png" },
    webp: { as: "image", type: "image/webp" },
  };
  const links = [];
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    /* istanbul ignore else */
    if (files?.length) {
      files.forEach((file) => {
        /* istanbul ignore else */
        if (!seen.has(file)) {
          seen.add(file);
          const [, EXT] = file.split(".");
          const filename = basename(file);
          /* istanbul ignore next - impossible to test */
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              const [, ext] = depFile.split(".");
              // links += renderPreloadLink(depFile);
              links.push(van.tags.link({...extensionProps[ext], crossorigin: "", href: depFile, rel: "preload" }));
              seen.add(depFile);
            }
          }
          // links += renderPreloadLink(file);
          links.push(van.tags.link({...extensionProps[EXT], crossorigin: "", href: file, rel: "preload" }));
        }
      });
    }
  });
  return links;
}
