declare module "@vanjs/server" {
  import type { PropsWithKnownKeys } from "vanjs-core";
  import type { SupportedTags } from "@vanjs/meta";
  import type { JSX } from "@vanjs/jsx";
  import type {
    Element as VanElement,
    TagFunc,
  } from "mini-van-plate/van-plate";

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

  /**
 * A function that takes a list of files and a manifest and returns an array of
 * VanJS components.
 * @param files the list of files
 * @param manifest the vite manifest
 * @returns HTML string
 */
  export const vanPreloadLinks: (
    files: string[],
    manifest: Record<string, string[]>,
  ) => (VanElement | TagFunc)[];

  type ValidVanNode =
    | boolean
    | number
    | string
    | VanElement
    | TagFunc;

  type VanComponent = () =>
    | HTMLElement
    | ValidVanNode
    | ValidVanNode[]
    | SupportedTags
    | SupportedTags[];
  export type Source =
    | JSX.Element
    | VanComponent
    | (() => VanComponent)
    | Promise<ValidVanNode>
    | ValidVanNode
    | undefined;

  /**
   * A function that takes a multitude of source types and returns a string
   * representing the HTML output.
   * @param source the source
   * @returns HTML string
   */
  export const renderToString: (source: Source) => Promise<string>;

  /**
   * A server utility to resolve files mainly in the src folder.
   * The relative file path must not contain any extension (EG: '.ts', '.jsx', etc),
   * this utility is meant to detect it.
   * 
   * @example
   * ```ts
   * const file = await import(resolveFile("/src/components/Header"))
   *  .then(module => module.Header || module.default)
   * 
   * ```
   * @param file the path relative to the root folder
   * @returns the resolved path file string
   */
  export const resolveFile: (file: string) => string;
}
