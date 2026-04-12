/*!
* vite-plugin-vanjs Van SSR v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { registerEnv } from "mini-van-plate/shared";
import van from "mini-van-plate/van-plate";
//#region src/setup/helpers.ts
function needsHydration(props) {
	return props && (Object.keys(props).some((k) => k.startsWith("on")) || Object.values(props).some((v) => v && typeof v === "object" && "val" in v));
}
//#endregion
//#region src/setup/van-ssr.ts
function tagWithHydration(ns, name, ...args) {
	const originalTag = ns ? van.tags(ns)[name] : van.tags[name];
	const [props, ...children] = Object.getPrototypeOf(args[0] ?? 0) === Object.prototype ? args : [{}, ...args];
	const finalProps = { ...props };
	if (needsHydration(props)) {
		finalProps["data-hk"] = "";
		for (const key in finalProps) if (key.startsWith("on")) delete finalProps[key];
	}
	return originalTag(finalProps, ...children);
}
function createTagsProxy() {
	return new Proxy((ns) => new Proxy(tagWithHydration.bind(void 0, ns), { get: (_, name) => tagWithHydration.bind(void 0, ns, name) }), { get: (_, name) => tagWithHydration.bind(void 0, void 0, name) });
}
const vanSSR = {
	...van,
	tags: createTagsProxy()
};
registerEnv({ van: vanSSR });
//#endregion
export { vanSSR as default };

//# sourceMappingURL=van-ssr.mjs.map