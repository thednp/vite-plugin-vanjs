import type { Element as VanElement } from "mini-van-plate/van-plate";
import type {
  DOMNodeAttributes,
  OutputElement,
  TagNames,
  ElementUnion,
} from "../types/types.d.ts";
import type { LayoutFile } from "../plugin/types.d.ts";

export type ComponentFn =
  | ((node?: unknown) => VanElement)
  | (() => ElementUnion)
  | (<T extends TagNames = "main", C = DOMNodeAttributes<T>>(
    props?: C,
  ) => OutputElement<T>);

export type RouteEntry = {
  path: string;
  component: () => Promise<ComponentModule>;
  params?: Record<string, string>;
  preload?: (
    params?: Record<string, string>,
  ) => boolean | void | Promise<boolean | void>;
  load?: (
    params?: Record<string, string>,
  ) => boolean | void | Promise<boolean | void>;
};

export type ImportFn = () => LazyComponent;

export type RouteProps = {
  path: string;
  params?: Record<string, string>;
  component:
    | ComponentFn
    | (() => Promise<ComponentModule>);
  preload?: (
    params?: Record<string, string>,
  ) => boolean | void | Promise<boolean | void>;
  load?: (
    params?: Record<string, string>,
  ) => boolean | void | Promise<boolean | void>;
};

export type FileRouteConfig = {
  routePath: string;
  path: string;
  layouts?: LayoutFile[];
};

export type ComponentModule = {
  component: ComponentFn;
  route?: Pick<RouteEntry, "load" | "preload">;
};

export type DynamicModule = {
  Page: ComponentFn;
  default?: ComponentFn;
  route?: Pick<RouteEntry, "load" | "preload">;
};

export type LazyComponent = Promise<DynamicModule>;
