/// <reference path="global.d.ts" />

import type {
  Element as VElement,
  TagFunc as IsoTagFunc,
} from "mini-van-plate/van-plate";
import type {
  ChildDom,
  Primitive,
  Props,
  PropsWithKnownKeys,
  PropValueOrDerived,
  State,
} from "vanjs-core";
import type { LayoutFile } from "../plugin/types.d.ts";

type PrimitiveChild = Primitive | State<Primitive | undefined | null>;

type DOMElement<T extends keyof HTMLElementTagNameMap = "div"> =
  | SVGElement
  | HTMLElement
  | Node
  | HTMLElementTagNameMap[T];

export type VanElement =
  | DOMElement
  | VElement
  | PrimitiveChild;
export type VanNode =
  | VanElement
  | VanElement[]
  | (() => VanElement | VanElement[])
  | null
  | undefined;

type ComponentProps1<T> = Props & PropsWithKnownKeys<T>;

type ComponentProps<K extends keyof HTMLElementTagNameMap> =
  & Props
  & PropsWithKnownKeys<HTMLElementTagNameMap[K]>;

export type VanComponent<
  K extends keyof HTMLElementTagNameMap = "div",
  O extends (Record<string, PropValueOrDerived> | undefined) = undefined,
> = {
  (
    props?: O extends object ? ComponentProps<K> & Partial<O>
      : ComponentProps<K>,
    ...children: ChildDom[]
  ): HTMLElementTagNameMap[K];
};

// router.mjs
export const Router:
  & VanComponent<"main">
  & JSX.Component<"main">;
export const FileSystemRouter:
  & VanComponent<"main">
  & JSX.Component<"main">;

// a.mjs
export const A:
  & VanComponent<"a">
  & JSX.Component<"a">;

// helpers.mjs
export const navigate: (
  href: string,
  options?: { replace?: boolean },
) => void;

export const reload: () => void;

export const redirect: (href?: string) => void | (() => void);

export const getValue: (v: unknown) => string;

export const isCurrentPage: (pageName: string) => boolean;

export const isCurrentLocation: (pageName: string) => boolean;

export const isLazyComponent: (component: unknown) => boolean;

export const executeLifecycle: (
  route: RouteEntry | {
    preload?: (params?: Record<string, string>) => unknown;
    load?: (params?: Record<string, string>) => unknown;
  } | null,
  params: Record<string, string> | undefined,
) => Promise<boolean>;

export const useRouteData: <T>() => T | undefined;

export const matchRoute: (path: string) => RouteEntry | null;

// extractParams.mjs
export const extractParams: (
  pattern: string,
  path: string,
) => Record<string, string> | null;

// routes.mjs
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

export const lazy: (importFn: ImportFn) => () => Promise<ComponentModule>;

export type RouteProps = {
  path: string;
  params?: Record<string, string>;
  component:
    | (() => DOMElement)
    | VanComponent
    | ComponentFn
    | (() => Promise<ComponentModule>);
  preload?: (
    params?: Record<string, string>,
  ) => boolean | void | Promise<boolean | void>;
  load?: (
    params?: Record<string, string>,
  ) => boolean | void | Promise<boolean | void>;
};

export type RouteConfig = {
  routePath: string;
  path: string;
  layouts?: LayoutFile[];
};

export const routes: RouteEntry[];

export const Route: (route: RouteProps) => void;

// state.mjs
export type RouterState = {
  pathname: string;
  searchParams: URLSearchParams;
  params: Record<string, string>;
  status: "idle" | "pending" | "success" | "error";
};

export const routerState: {
  pathname: RouterState["pathname"];
  searchParams: RouterState["searchParams"];
  params?: RouterState["params"];
  status: RouterState["status"];
};

export const setRouterState: (
  href: string,
  search?: string,
  params?: Record<string, string>,
) => void;

export const microStore: <T extends Record<string, unknown>>(init: T) => T;

// routeCache.mjs
export const cacheRoute: (key: ImportFn, value: ComponentModule) => void;

export const getCachedRoute: (key: ImportFn) => ComponentModule | undefined;

export const fixRouteUrl: (url: string) => string;

// unwrap.mjs
export type UnwrapResult = { children: VanNode[] };

export const unwrap: (
  source:
    | VanNode
    | VanNode[]
    | VanComponent
    | { children: VanNode[] }
    | ComponentFn
    | ReturnType<IsoTagFunc>
    | ReturnType<IsoTagFunc>[]
    | (() =>
      | ReturnType<IsoTagFunc>
      | ReturnType<IsoTagFunc>[]
      | VanNode
      | VanNode[]),
  ...children: VanNode[]
) => UnwrapResult;

export type JSXComponentFn = () => JSX.Element;
export type FragmentFn = () => ChildDom | ChildDom[];
export type ComponentFn = FragmentFn | VanComponent | JSXComponentFn;

export type ComponentModule = {
  component: ComponentFn;
  route?: Pick<RouteEntry, "load" | "preload">;
};

export type LazyComponent = Promise<{
  default?: ComponentFn;
  Page?: ComponentFn;
  route?: Pick<RouteEntry, "load" | "preload">;
}>;

// dataCache.mjs
export type CacheEntry<T = unknown> = {
  data: T;
  error: Error | null;
  timestamp: number;
};

export const dataCache: {
  get<T>(pathname: string, key: string): CacheEntry<T> | undefined;
  set<T>(pathname: string, key: string, entry: Partial<CacheEntry<T>>): void;
  has(pathname: string, key?: string): boolean;
  getRoute(pathname: string): Record<string, CacheEntry> | undefined;
  del(pathname: string, key?: string): boolean;
  clear(): void;
  touch(pathname: string): void;
  toJSON(): Record<string, Record<string, CacheEntry>>;
  hydrateFromJSON(json: Record<string, Record<string, CacheEntry>>): void;
  size(): number;
  setMaxRoutes(n: number): void;
};
