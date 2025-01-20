
declare module "@vanjs/router" {
  import { TagFunc } from "mini-van-plate";
  import { reactive } from "vanjs-ext";
  import van from "vanjs-core";

  type VanNode = TagFunc<Element> | Element | Element[] | undefined;

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
  // export const Router: () => VanNode[] | Promise<() => VanNode[]>;
  export const Router: () => (VanNode[] | Promise<VanNode | VanNode[]>);

  // link.mjs
  /**
   * A virtual component that creates an anchor element
   * that navigates to the specified href when clicked.
   *
   * @example
   * import { Link } from '@vanjs/router';
   * import van from 'vanjs-core';
   * 
   * export const Navigation = () => {
   *   const { nav } = van.tags
   *   return nav(
   *     Link({ href="/" }, "Home"), // or <Link href="/">Home</Link> with JSX
   *     Link({ href="/about" }, "About"), // or <Link href="/about">About</Link> with JSX
   *     // ...other children
   *   );
   * }
   */
  export const A: (props: Partial<HTMLAnchorElement>, ...children: (Element | Node | string)[]) => HTMLAnchorElement;

  // helpers.mjs
  /**
   * Navigates to the specified href in the client and sets the router state.
   * Keep in mind that the router handles the search params and hash.
   *
   * @param {string} href the URL to navigate to
   * @param {{ replace?: boolean }} options when true, will replace the current history entry
   */
  export const navigate: (href: string, options: { replace?: boolean } = {}) => void;

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

  // routes.mjs
  export type RouteEntry = {
      path: string;
      component: () => VanNode | VanNode[] | Promise<VanNode | VanNode[]>;
  }
  export const routes: RouteEntry[];

  /**
   * Registers a new route in the router state.
   * @param {RouteEntry} route the route to register
   * 
   * @example
   * import { route } from '@vanjs/router';
   * 
   * route({ path: '/', component: Home });
   * route({ path: '/about', component: About });
   * route({ path: '*', component: NotFound });
   */
  export const Route: (route: RouteEntry) => void;

  // state.mjs
  export type RouterState = {
      pathname: string;
      searchParams: URLSearchParams;
  }
  /**
   * A reactive object that holds the current router state.
   * This state is maintained by both server and client.
   */
  export const routerState: typeof van.state<RouterState>;

  /**
   * Sets the router state to the specified href.
   * @param {string} href the URL to navigate to
   * @param {boolean} replace when true, will replace the current history entry
   */
  export const setRouterState: (href: string, replace?: boolean | undefined) => void;

  /**
 * Merge the children of an Element or an array of elements with an optional array of children
 * into the childen of a single HTMLFragmentElement element.
 * @param  source
 * @param  {...Element[]} children
 * @returns {TagFunc<HTMLIFrameElement>}
 */
  export const unwrap: (source: Element | (() => Element | Element[]), ...children?: Element[]) => TagFunc<HTMLIFrameElement>;


  export type ComponentModule = {
      component: () => VanNode | VanNode[];
      route: RouteEntry;
  }

  /**
 * Registers a lazy component.
 * @param importFn
 * @returns 
 */
  export const lazy = (importFn: Promise<VanNode>) => ComponentModule
}
