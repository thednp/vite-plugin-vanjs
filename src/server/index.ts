import { basename } from "node:path";
// Re-export plugin helpers (still in .mjs until plugin migration)

export type * from "./types.d.ts";
export * from "../plugin/helpers.ts";

/**
 * Get the file most probable route path for a given potential route.
 */
type RenderSource = (() => unknown) | unknown;

/**
 * A function that takes a multitude of source types and returns a string
 * representing the HTML output.
 * @param source the source
 * @returns HTML string
 */
export async function renderToString(
  inputSource: RenderSource,
): Promise<string> {
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
  if (typeof source === "object" && source !== null && "render" in source) {
    return (source as { render: () => string }).render();
  }
  if (source instanceof Promise) {
    return renderToString(await source);
  }
  if (Array.isArray(source)) {
    const elements: string[] = [];
    for (const el of source) {
      elements.push(await renderToString(el));
    }
    return elements.join("");
  }

  console.warn("Render error! Source not recognized: " + source);
  return "";
}

function renderPreloadLink(file: string): string {
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
    console.warn("Render error! File format not recognized: " + file);
    return "";
  }
}

type Manifest = Record<string, string[]>;

/**
 * A function that takes a list of files and a manifest and returns a string
 * representing the HTML markup for preload links.
 * @param files the list of files
 * @param manifest the vite manifest
 * @returns HTML string
 */
export function renderPreloadLinks(
  modules: string[],
  manifest: Manifest,
): string {
  let links = "";
  const seen = new Set<string>();
  const ignoredAssets = new Set<string>();

  Object.entries(manifest).forEach(([id, files]) => {
    if (
      ["src/pages", "src/routes", "vite-plugin-vanjs/"].some((l) =>
        id.includes(l)
      )
    ) {
      files.forEach((asset) => ignoredAssets.add(asset));
    }
  });

  modules.forEach((id) => {
    const files = manifest[id];

    if (files?.length) {
      files.forEach((file) => {
        if (seen.has(file) || ignoredAssets.has(file)) return;

        seen.add(file);
        const filename = basename(file);

        if (manifest[filename]) {
          for (const depFile of manifest[filename]) {
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
