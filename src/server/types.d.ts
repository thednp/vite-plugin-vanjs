// FILE SYSTEM ROUTER
export type PageFile = { path: string; routePath: string };
export type LayoutFile = { id: string; path: string };
export type RouteFile = PageFile & { layouts: Array<LayoutFile> };
export type PluginConfig = { routesDir: string; extensions: string[] };
