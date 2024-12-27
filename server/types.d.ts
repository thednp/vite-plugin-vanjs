/// <reference path="global.d.ts" />

/**
 * A function that takes a list of files and a manifest and returns a string
 * representing the HTML markup for preload links.
 * @param files the list of files
 * @param manifest the vite manifest
 * @returns HTML string
 */
export const renderPreloadLinks: (files: string[], manifest: Record<string, string[]>) => string;

type VanElement = import("mini-van-plate/van-plate").Element;
type TagFunc = import("mini-van-plate/van-plate").TagFunc;
export type Source = number | string | VanElement | VanElement[] | TagFunc | undefined;

/**
 * A function that takes a multitude of source types and returns a string
 * representing the HTML output.
 * @param source the source
 * @returns HTML string
 */
export const renderToString: (source: Source) => string;
