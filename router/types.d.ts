/// <reference path="global.d.ts" />
import type {
  Element as VElement,
  TagFunc as IsoTagFunc,
} from "mini-van-plate/van-plate";
import type { JSX } from "@vanjs/jsx";
import van from "vanjs-core";
import type { Primitive, Props, PropsWithKnownKeys, TagFunc } from "vanjs-core";

type VanElement = VElement | Exclude<Primitive, boolean | undefined>;
type VanNode =
  | (SVGElement | HTMLElement | JSX.Component | TagFunc<Element>)
  | VanElement;

type CompProps<T> =
  & Props
  & PropsWithKnownKeys<T>
  & {
    children?: VanNode | VanNode[];
  };
export type VanComponent<T extends Element = HTMLElement> = (
  props?: Partial<CompProps<T>>,
  ...children: VanNode[]
) => T;

// router.mjs
/**
 * A virtual component that renders the current route
 * in your VanJS application. It must be used in your main component.
 *
 * @example
 * import { Router } from '@vanjs/router';
 *
 * export const App = () => {
 *   return Router(); // or <Router /> for JSX
 * }
 */
export const Router: (props?: RouterProps) => VanNode | VanNode[] | JSX.Element;

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
 *   const { nav } = van.tags
 *   return nav(
 *     A({ href="/" }, "Home"), // or <A href="/">Home</A> with JSX
 *     A({ href="/about" }, "About"), // or <A href="/about">About</A> with JSX
 *     // ...other children
 *   );
 * }
 */
export const A: (props: Partial<AnchorProps>) => HTMLAnchorElement;

// helpers.mjs
/**
 * Navigates to the specified href in the client and sets the router state.
 * Keep in mind that the router handles the search params and hash.
 *
 * @param href the URL to navigate to
 * @param options when true, will replace the current history entry
 */
export const navigate: (href: string, options?: { replace?: boolean }) => void;

/**
 * A client only helper function that reloads the current page.
 */
export const reload: () => void;

/**
 * A helper function that redirects the user to the specified href.
 * When called in the server, it will return a function that will redirect the user
 * to the specified href when called.
 * @param {string | undefined} href the URL to redirect to
 */
export const redirect: (href?: string) => void | (() => void);

export type VanComponent = () => VanNode | VanNode[] | JSX.Element;

// routes.mjs
export type RouteEntry = {
  path: string;
  component: Promise<ComponentModule>;
  preload?: (params?: Record<string, string>) => void;
  load?: (params?: Record<string, string>) => void;
};

export type RouteProps = {
  path: string;
  component: VanComponent | (() => ComponentModule);
  preload?: (params?: Record<string, string>) => void;
  load?: (params?: Record<string, string>) => void;
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
  params?: Record<string, string>;
};
/**
 * A reactive object that holds the current router state.
 * This state is maintained by both server and client.
 */
export const routerState: {
  pathname: van.state<RouterState.pathname>;
  searchParams: van.state<RouterState.searchParams>;
  params?: van.state<RouterState.params>;
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
 * Merge the children of an Element or an array of elements with an optional array of children
 * into the childen of a single HTMLFragmentElement element.
 * @param source
 * @param children
 */
export const unwrap: (
  source:
    | VanNode
    | IsoTagFunc
    | VanNode[]
    | IsoTagFunc[]
    | (() => IsoTagFunc | IsoTagFunc[] | VanNode | VanNode[]),
  ...children: VanNode[]
) => VanNode;

export type ComponentModule = {
  component: VanComponent | JSX.Element;
  route: Pick<RouteEntry, "load" | "preload">;
};

export type DynamicModule = {
  Page: VanComponent | JSX.Element;
  default?: VanComponent | JSX.Element;
  route?: Pick<RouteEntry, "load" | "preload">;
};

export type LazyComponent =
  | Promise<DynamicModule>
  | (() => Promise<DynamicModule>);

export const lazy: (importFn: () => LazyComponent) => () => ComponentModule;

export const fixRouteUrl: (url: string) => string;
