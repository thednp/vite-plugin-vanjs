declare module "@vanjs/router" {
  import type {
    Element as VElement,
    TagFunc as IsoTagFunc,
  } from "mini-van-plate/van-plate";
  import van from "vanjs-core";
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
  /**
   * A virtual component that renders the current route
   * in your VanJS application. It must be used in your main component.
   *
   * @example
   * import { Router } from '@vanjs/router';
   *
   * export const App = () => {
   * return Router(); // or <Router /> for JSX
   * }
   */
  export const Router:
    & VanComponent<"main">
    & JSX.Component<"main">;
  export const FileSystemRouter:
    & VanComponent<"main">
    & JSX.Component<"main">;

  // a.mjs
  /**
   * A virtual component that creates an anchor element
   * that navigates to the specified href when clicked.
   *
   * @example
   * import { A } from '@vanjs/router';
   * import van from 'vanjs-core';
   *
   * export const Navigation = () => {
   * const { nav } = van.tags
   * return nav(
   * A({ href="/" }, "Home"),
   * A({ href="/about" }, "About"),
   * );
   * }
   */
  export const A:
    & VanComponent<"a">
    & JSX.Component<"a">;

  // helpers.mjs
  /**
   * Navigates to the specified href in the client and sets the router state.
   * Keep in mind that the router handles the search params and hash.
   *
   * @param href the URL to navigate to
   * @param options when true, will replace the current history entry
   */
  export const navigate: (
    href: string,
    options?: { replace?: boolean },
  ) => void;

  /** A client only helper function that reloads the current page. */
  export const reload: () => void;

  /**
   * A helper function that redirects the user to the specified href.
   * When called in the server, it will return a function that will redirect the user
   * to the specified href when called.
   * @param href the URL to redirect to
   */
  export const redirect: (href?: string) => void | (() => void);

  /**
   * Returns the string value of a State or primitive
   */
  export const getValue: (v: unknown) => string;

  /**
   * Check if selected page is the current page
   */
  export const isCurrentPage: (pageName: string) => boolean;

  /**
   * Check if selected page is related to the current page
   */
  export const isCurrentLocation: (pageName: string) => boolean;

  /**
   * Check if component is a lazy component
   */
  export const isLazyComponent: (component: unknown) => boolean;

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

  /**
   * Registers a new route in the router state.
   * @param route the route to register
   *
   * @example
   * import { Route, lazy } from '@vanjs/router';
   * import Home from './pages/Home';
   * import NotFound from './pages/NotFound';
   *
   * Route({ path: '/', component: Home });
   * Route({ path: '/about', component: lazy(() => import("./pages/About.ts")) });
   * Route({ path: '*', component: NotFound });
   */
  export const Route: (route: RouteProps) => void;

  // state.mjs
  export type RouterState = {
    pathname: string;
    searchParams: URLSearchParams;
    params: Record<string, string>;
    status: "idle" | "pending" | "success" | "error";
  };

  /**
   * A reactive object that holds the current router state.
   * This state is maintained by both server and client.
   */
  export const routerState: {
    pathname: RouterState["pathname"];
    searchParams: RouterState["searchParams"];
    params?: RouterState["params"];
    status: RouterState["status"];
  };

  /**
   * Sets the router state to the specified href.
   * @param href the URL to navigate to
   * @param search the search string
   * @param params the route params object
   */
  export const setRouterState: (
    href: string,
    search?: string,
    params?: Record<string, string>,
  ) => void;

  /**
   * Creates a reactive micro store from an initial object
   */
  export const microStore: <T extends Record<string, unknown>>(init: T) => T;

  /**
   * Fixes the URL of a route.
   * @param url
   */
  export const fixRouteUrl: (url: string) => string;

  // unwrap.mjs
  /**
   * Merge the children of an Element or an array of elements with an optional array of children
   * into the children property of a simple object.
   */
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

  /**
   * Registers a lazy component.
   * @param importFn
   */
  export const lazy: (importFn: ImportFn) => () => Promise<ComponentModule>;

  /**
   * Cache a route.
   * @param key the cache route key
   * @param value the cache route
   */
  export const cacheRoute: (key: ImportFn, value: ComponentModule) => void;

  /**
   * Return a route cache.
   * @param key the cache route key
   */
  export const getCachedRoute: (key: ImportFn) => ComponentModule | undefined;

  /**
   * Execute lifecycle methods preload and / or load
   */
  export const executeLifecycle: (
    route: RouteEntry | {
      preload?: (params?: Record<string, string>) => unknown;
      load?: (params?: Record<string, string>) => unknown;
    } | null,
    params: Record<string, string> | undefined,
  ) => Promise<boolean>;

  /**
   * Find a registered route that matches the given path
   */
  export const matchRoute: (path: string) => RouteEntry | null;

  /**
   * Convenience hook to get the current route's cached data.
   */
  export const useRouteData: <T>() => T | undefined;

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
}
