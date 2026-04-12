/*!
* vite-plugin-vanjs JSX Dev Runtime v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import van from "@vanjs/van";
import { setAttributeNS, styleToString } from "@vanjs/client";
//#region src/setup/isServer.ts
const isServer = typeof window === "undefined";
const namespaceElements = Object.entries({
	"http://www.w3.org/1999/xhtml": [
		"a",
		"style",
		"title"
	],
	"http://www.w3.org/2000/svg": [
		"svg",
		"a",
		"animate",
		"animateMotion",
		"animateTransform",
		"circle",
		"clipPath",
		"defs",
		"desc",
		"ellipse",
		"feBlend",
		"feColorMatrix",
		"feComponentTransfer",
		"feComposite",
		"feConvolveMatrix",
		"feDiffuseLighting",
		"feDisplacementMap",
		"feDistantLight",
		"feDropShadow",
		"feFlood",
		"feFuncA",
		"feFuncB",
		"feFuncG",
		"feFuncR",
		"feGaussianBlur",
		"feImage",
		"feMerge",
		"feMergeNode",
		"feMorphology",
		"feOffset",
		"fePointLight",
		"feSpecularLighting",
		"feSpotLight",
		"feTile",
		"feTurbulence",
		"filter",
		"foreignObject",
		"g",
		"image",
		"line",
		"linearGradient",
		"marker",
		"mask",
		"metadata",
		"mpath",
		"path",
		"pattern",
		"polygon",
		"polyline",
		"radialGradient",
		"rect",
		"set",
		"stop",
		"style",
		"switch",
		"symbol",
		"text",
		"textPath",
		"title",
		"tspan",
		"use",
		"view"
	],
	"http://www.w3.org/1998/Math/MathML": [
		"math",
		"maction",
		"maligngroup",
		"malignmark",
		"menclose",
		"merror",
		"mfenced",
		"mfrac",
		"mglyph",
		"mi",
		"mlabeledtr",
		"mmultiscripts",
		"mn",
		"mo",
		"mover",
		"mpadded",
		"mphantom",
		"mprescripts",
		"mroot",
		"mrow",
		"ms",
		"mspace",
		"msqrt",
		"mstyle",
		"msub",
		"msubsup",
		"msup",
		"mtable",
		"mtd",
		"mtext",
		"mtr",
		"munder",
		"munderover",
		"semantics",
		"annotation",
		"annotation-xml"
	]
}).reduce((acc, [namespace, elements]) => {
	elements.forEach((element) => {
		if (!(element in acc)) acc[element] = namespace;
	});
	return acc;
}, {});
//#endregion
//#region src/jsx/jsx.ts
const Fragment = ({ children }) => children;
function jsx(jsxTag, { children, ref, ...rest }) {
	const props = Object.fromEntries(Object.entries(rest).filter(([, val]) => val !== void 0));
	if (typeof jsxTag === "string") {
		const ns = namespaceElements[jsxTag];
		const newElement = (ns ? van.tags(ns) : van.tags)[jsxTag](props, children);
		if (isServer) return newElement;
		for (const [k, value] of Object.entries(props)) {
			const attrNamespace = k === "xmlns" ? null : newElement.namespaceURI;
			if (k === "style") {
				van.derive(() => {
					const styleValue = styleToString(value);
					if (isServer) newElement.propsStr += ` style="${styleValue}"`;
					else newElement.style.cssText = styleValue;
				});
				continue;
			}
			if (typeof value === "function" && !k.startsWith("on")) {
				van.derive(() => setAttributeNS(attrNamespace, newElement, k, value()));
				continue;
			}
			if (typeof value === "function" && k.startsWith("on")) {
				newElement.addEventListener(k.slice(2).toLowerCase(), value);
				continue;
			}
			if (typeof value === "object" && value !== null && "val" in value) {
				van.derive(() => setAttributeNS(attrNamespace, newElement, k, value.val));
				continue;
			}
			setAttributeNS(attrNamespace, newElement, k, value);
		}
		if (ref) ref.val = { current: newElement };
		return newElement;
	}
	return typeof jsxTag === "function" ? jsxTag({
		children,
		ref,
		...props
	}) : null;
}
//#endregion
export { Fragment, jsx as createElement, jsx, jsx as jsxDEV, jsx as jsxs };

//# sourceMappingURL=jsx-dev-runtime.mjs.map