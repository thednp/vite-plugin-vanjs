/*!
* vite-plugin-vanjs Meta v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import van from "vanjs-core";
//#region src/setup/isServer.ts
const isServer = typeof window === "undefined";
//#endregion
//#region src/meta/helpers.ts
function parseAttributes(attributeString) {
	const attributes = {};
	const attributeRegex = /([a-zA-Z0-9_-]+)(?:="([^"]*?)")?/g;
	let match;
	while ((match = attributeRegex.exec(attributeString)) !== null) {
		const name = match[1];
		attributes[name] = match[2] ?? "";
	}
	return attributes;
}
function getTagAttribute(tag) {
	for (const attr of [
		"name",
		"property",
		"charset",
		"viewport",
		"media",
		"http-equiv",
		"rel",
		"src",
		"href",
		"id"
	]) {
		const value = isServer ? tag[attr] : tag.getAttribute(attr);
		if (value) return value;
	}
	return "";
}
function getTagKey(tag) {
	const normalizedTag = isServer ? {
		tagName: tag.name.toUpperCase(),
		...parseAttributes(tag.propsStr)
	} : { tagName: tag.tagName };
	return normalizedTag.tagName + (normalizedTag.tagName !== "TITLE" ? `.${getTagAttribute(tag)}` : "");
}
//#endregion
//#region src/meta/Head.ts
const createHeadTags = () => /* @__PURE__ */ new Map();
const getHeadTags = (() => {
	if (isServer) {
		let serverHeadTags;
		return () => {
			if (!serverHeadTags) serverHeadTags = createHeadTags();
			return serverHeadTags;
		};
	}
	const clientHeadTags = createHeadTags();
	return () => clientHeadTags;
})();
function resetHeadTags() {
	getHeadTags().clear();
}
function initializeHeadTags() {
	const tags = getHeadTags();
	if (!tags.size && !isServer) Array.from(document.head.children).forEach((tag) => {
		tags.set(getTagKey(tag), tag);
	});
}
function addMeta(tag) {
	if (!tag) return;
	const tags = getHeadTags();
	const key = getTagKey(tag);
	tags.set(key, tag);
}
function Head() {
	return () => {
		const tags = getHeadTags();
		return Array.from(tags.values());
	};
}
//#endregion
//#region src/meta/tags.ts
function Title(props, content) {
	const { title } = van.tags;
	addMeta(title(props, content));
	return null;
}
function Meta(props) {
	const { meta } = van.tags;
	addMeta(meta(props));
	return null;
}
//#endregion
export { Head, Meta, Title, addMeta, getTagAttribute, getTagKey, initializeHeadTags, parseAttributes, resetHeadTags };

//# sourceMappingURL=meta.mjs.map