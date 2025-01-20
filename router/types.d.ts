/// <reference path="global.d.ts" />
import { reactive } from "vanjs-ext";
import { Van } from "vanjs-core";

export type VanNode = Element | Element[] | undefined;

export const Router: () => VanNode[] | Promise<() => VanNode[]>;

export type ComponentModule = {
    component: () => VanNode | VanNode[];
    route: RouteEntry;
}

export type GetCachedRoute = (key: string) => ComponentModule;
export type CacheRoute = (key: string, route: ComponentModule) => void;

export const A: (props: Partial<HTMLAnchorElement>, ...children: (Element | Node | string)[]) => HTMLAnchorElement;

export const navigate: (href: string, options: { replace?: boolean } = {}) => void;
export const reload: () => void;
export const redirect: (href?: string) => void | (() => void);

export type RouteEntry = {
    path: string;
    component: () => VanNode | VanNode[] | Promise<VanNode | VanNode[]>;
    preload?: (params?: Record<string, string>) => any;
    load?: (params?: Record<string, string>) => any;
}

export const routes: RouteEntry[];
export const Route: (route: Route) => void;

export type RouterState = {
    pathname: Van.state<string>;
    searchParams: Van.state<URLSearchParams>;
}
export const routerState: typeof reactive<RouterState>;
export const setRouterState: (href: string, replace?: boolean | undefined) => void;
