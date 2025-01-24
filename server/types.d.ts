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

type VanComponent = () => ValidVanNode | ValidVanNode[];
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
