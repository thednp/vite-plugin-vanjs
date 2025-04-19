/// <reference path="global.d.ts" />
import type { Element as VanElement, TagFunc } from "mini-van-plate/van-plate";

/**
 * A function that takes a list of files and a manifest and returns a string
 * representing the HTML markup for preload links.
 * @param files the list of files
 * @param manifest the vite manifest
 * @returns HTML string
 */
export const renderPreloadLinks: (
  files: string[],
  manifest: Record<string, string[]>,
) => string;

type ValidVanNode =
  | boolean
  | number
  | string
  | VanElement
  | TagFunc;

type VanComponent = () => HTMLElement | ValidVanNode | ValidVanNode[];
export type Source =
  | Promise<ValidVanNode>
  | VanComponent
  | (() => VanComponent)
  | ValidVanNode
  | ValidVanNode[]
  | undefined;

/**
 * A function that takes a multitude of source types and returns a string
 * representing the HTML output.
 * @param source the source
 * @returns HTML string
 */
export const renderToString: (source: Source) => Promise<string>;

// FILE SYSTEM ROUTER
/**
 * Get the file most probable route path for a given potential route.
 */
export const fileToRoute: (file: string, routesDir: string) => string;

export type PageFile = { path: string; routePath: string };
export type LayoutFile = { id: string; path: string };
export type PluginConfig = { routesDir: string; extensions: string[] };
/**
 * Find all layout files for a given route.
 */

export const findLayouts: (routePath: string) => Array<LayoutFile>;

/**
 * Identify all files in a folder.
 */
export const globFiles: (
  dir: string,
  extensions: string[],
) => Promise<Array<string>>;

/**
 * Scan routes directory and generate routes.
 */
export const scanRoutes: (
  config: ResolvedConfig,
  pluginConfig: PluginConfig,
) => Promise<
  Array<{ path: string; routePath: string }>
>;

/**
 * Process routes and identify their layouts
 */
export const processLayoutRoutes: (
  routes: Array<PageFile>,
  config: ResolvedConfig,
  pluginConfig: PluginConfig,
) => Promise<Array<PageFile & { layouts: Array<LayoutFile> }>>;
