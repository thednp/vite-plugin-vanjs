import { basename } from "node:path";
import van from "@vanjs/van";
import { Link, Meta, resetHeadTags, Script, Title } from "@vanjs/meta";

/**
 * @type {typeof import("./types.d.ts").Template}
 */
export const Template = (props = {}) => {
  // we reset head tags here
  resetHeadTags();
  const { body, footer, head, header, html, main } = van.tags;
  // HEAD TAGS
  // REQUIRED TAGS
  Meta({ charset: "UTF-8" });
  Meta({ name: "viewport", content: "width=device-width, initial-scale=1.0" });
  // DEFAULT TAGS
  Title("VanJS Starter Template");
  Meta({ name: "description", content: "VanJS Starter Template Description" });

  return [
    "<!doctype html>",
    html(
      { lang: props.lang || "en" },
      head(
        "{app-head}",
        "{preload-links}",
      ),
      body(
        { class: "flex flex-col min-h-screen bg-base-300" },
        header(
          { id: "app-header", class: "navbar bg-base-100" },
          "{app-header}",
        ),
        main({ id: "app" }, "{app-html}"),
        footer(
          { id: "app-footer", class: "flex p-4 mt-auto bg-base-100" },
          "{app-footer}",
        ),
        Script({ type: "module", src: "/src/entry-client.js" }),
      ),
    ),
  ];
};

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
  if (file.endsWith(".js") || file.endsWith(".mjs")) {
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
