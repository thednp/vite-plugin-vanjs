/*!
* vite-plugin-vanjs Client v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { unwrap } from "vite-plugin-vanjs/router";
import { getTagKey } from "vite-plugin-vanjs/meta";
//#region src/client/index.ts
/**
* Sets the attribute value of a given name of a given element.
*
* @param element the target element
* @param key the attribute name
* @param value the attribute value
*/
function setAttribute(element, key, value) {
	if (value == null || value === false || value === "" || value === void 0) element.removeAttribute(key);
	else {
		const attr = value === true ? "" : String(value);
		element.setAttribute(key, attr);
	}
}
/**
* Sets a namespaced attribute value of a given namespace,
* name and a given element. Fallback to regular setAttribute
* automatically.
*
* @param namespace the namespace string
* @param element the target element
* @param key the attribute name
* @param value the attribute value
*/
function setAttributeNS(ns, element, key, value) {
	const elementNS = ns || element.namespaceURI || null;
	const attrNamespaces = {
		"xlink:": "http://www.w3.org/1999/xlink",
		"xml:": "http://www.w3.org/XML/1998/namespace",
		"xsi:": "http://www.w3.org/2001/XMLSchema-instance"
	};
	let attrNS = elementNS;
	for (const [prefix, uri] of Object.entries(attrNamespaces)) if (key.startsWith(prefix)) {
		attrNS = uri;
		break;
	}
	if (value == null || value === false || value === "" || value === void 0) try {
		if (attrNS && attrNS !== "null") element.removeAttributeNS(attrNS, key.replace(/^[^:]+:/, ""));
		else {
			element.removeAttribute(key);
			element.removeAttribute(key.replace(/^[^:]+:/, ""));
		}
	} catch {}
	else {
		const attr = value === true ? key.replace(/^[^:]+:/, "") : String(value);
		try {
			element.setAttributeNS(attrNS, key, attr);
		} catch {
			element.setAttribute(key, attr);
		}
	}
}
/**
* Normalize the style value and convert it to a string
*
* @param source the style value
* @returns the normalized style string
*/
function styleToString(style) {
	return typeof style === "string" ? style : typeof style === "object" ? Object.entries(style).reduce((acc, [key, value]) => acc + key.split(/(?=[A-Z])/).join("-").toLowerCase() + ":" + (typeof value === "object" && value !== null && "val" in value ? value.val : value) + ";", "") : "";
}
function elementsMatch(el1, el2, deep) {
	if (!(el2 instanceof HTMLElement) || el1.tagName !== el2.tagName || el1.id !== el2.id || el1.className !== el2.className) return false;
	const childNodes1 = Array.from(el1.childNodes);
	const childNodes2 = Array.from(el2.childNodes);
	if (childNodes1.length !== childNodes2.length) return false;
	if (!childNodes1.some((child) => child instanceof HTMLElement && (child.hasAttribute("data-hk") || child.querySelector("[data-hk]")))) return true;
	return deep ? childNodes1.every((child, idx) => elementsMatch(child, childNodes2[idx])) : true;
}
function createHydrationContext() {
	const parentCache = /* @__PURE__ */ new WeakMap();
	function getParent(element, root) {
		const cacheKey = element;
		if (parentCache.has(cacheKey)) {
			const cached = parentCache.get(cacheKey);
			if (cached && cached.isConnected && root.contains(cached)) return cached;
			parentCache.delete(cacheKey);
		}
		const chain = [];
		let current = element;
		while (current !== root && current) {
			chain.push(current);
			current = current.parentElement;
		}
		const parent = chain.slice(-1)[0];
		if (parent) parentCache.set(cacheKey, parent);
		return parent ?? null;
	}
	function diffAndHydrate(oldDom, newDom) {
		if (!oldDom || !newDom) return;
		if (!oldDom.children.length && !elementsMatch(oldDom, newDom)) {
			oldDom.replaceChildren(...unwrap(newDom).children);
			return;
		}
		if (newDom instanceof Array) {
			oldDom.replaceChildren(...unwrap(newDom).children);
			return;
		}
		const oldSet = /* @__PURE__ */ new Set();
		const newSet = /* @__PURE__ */ new Set();
		const processElements = (root, set) => {
			const elements = root.querySelectorAll("[data-hk]");
			let lastParent = null;
			elements.forEach((el) => {
				const parent = getParent(el, root);
				if (parent && parent !== lastParent) {
					set.add(parent);
					lastParent = parent;
				}
			});
		};
		processElements(oldDom, oldSet);
		processElements(newDom, newSet);
		if (newSet.size > 0) {
			const newArray = Array.from(newSet);
			oldSet.forEach((el) => {
				const match = newArray.find((m) => elementsMatch(m, el));
				if (match) el.replaceWith(match);
			});
		}
	}
	return { diffAndHydrate };
}
/**
* Hydrate a target element with the given content(s).
*
* @param target the root element
* @param content the element(s) to hydrate
*/
function hydrate(target, content) {
	if (content instanceof Promise) {
		content.then((res) => {
			if (!target.hasAttribute("data-h")) {
				const { diffAndHydrate } = createHydrationContext();
				diffAndHydrate(target, res);
				target.setAttribute("data-h", "");
			} else {
				const wrapper = unwrap(res);
				target.replaceChildren(...Array.from(wrapper.children));
			}
		});
		return target;
	}
	const wrapper = unwrap(content);
	const currentChildren = Array.from(target.children);
	const newChildren = Array.from(wrapper.children);
	if (target.tagName.toLowerCase() === "head") {
		if (!target.hasAttribute("data-h")) {
			target.setAttribute("data-h", "");
			return target;
		}
		newChildren.forEach((newChild) => {
			const key = getTagKey(newChild);
			const existing = currentChildren.find((child) => getTagKey(child) === key);
			if (existing) existing.replaceWith(newChild);
			else target.appendChild(newChild);
		});
	} else if (!target.hasAttribute("data-h")) {
		const { diffAndHydrate } = createHydrationContext();
		diffAndHydrate(target, content);
		target.setAttribute("data-h", "");
	} else target.replaceChildren(...newChildren);
	return target;
}
//#endregion
export { elementsMatch, hydrate, setAttribute, setAttributeNS, styleToString };

//# sourceMappingURL=client.mjs.map