/// <reference path="global.d.ts" />
import { reactive } from "vanjs-ext";

export type VanNode = Element | Element[] | undefined;

// router.mjs
export const Router: (() => VanNode[]) | Promise<VanNode[]>;

// link.mjs
export const Link: (props: Partial<HTMLAnchorElement>, ...children: (Element | Node | string)[]) => HTMLAnchorElement;

// helpers.mjs
export const navigate: (href: string, options: { replace?: boolean } = {}) => void;
export const reload: () => void;
export const redirect: (href?: string) => void | (() => void);

// routes.mjs
export type Route = {
    path: string;
    component: (() => VanNode | VanNode[]) | Promise<VanNode | VanNode[]>;
}

export const routes: Route[];
export const route: (route: Route) => void;

// state.mjs
export type RouterState = {
    pathname: string;
    searchParams: URLSearchParams;
}
export const routerState: typeof reactive<RouterState>;
export const setRouterState: (href: string, replace?: boolean | undefined) => void;
