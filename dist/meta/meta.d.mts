/*!
* vite-plugin-vanjs Meta v0.2.0 (https://github.com/thednp/vite-plugin-vanjs#README)
* Copyright 2025-2026 © thednp
* Licensed under MIT (https://github.com/thednp/vite-plugin-vanjs/blob/master/LICENSE)
*/
import { PropsWithKnownKeys } from "vanjs-core";
import { TagFunc } from "mini-van-plate/van-plate";

//#region src/meta/types.d.ts
type SupportedTags = HTMLTitleElement | HTMLMetaElement;
type AllHeadTags = HTMLTitleElement | HTMLScriptElement | HTMLStyleElement | HTMLLinkElement | HTMLMetaElement;
type TagProps = SupportedTags | PropsWithKnownKeys<SupportedTags>;
type HeadTags = AllHeadTags[] | TagFunc[];
//#endregion
//#region src/meta/Head.d.ts
declare function resetHeadTags(): void;
declare function initializeHeadTags(): void;
declare function addMeta(tag?: SupportedTags | null): void;
declare function Head(): () => AllHeadTags[];
//#endregion
//#region src/meta/tags.d.ts
declare function Title(props: PropsWithKnownKeys<HTMLTitleElement>, content?: string): null;
declare function Meta(props: PropsWithKnownKeys<HTMLMetaElement> & {
  charset?: string;
}): null;
//#endregion
//#region src/meta/helpers.d.ts
declare function parseAttributes(attributeString: string): Record<string, string>;
type ServerTag = {
  name: string;
  propsStr: string;
};
type TagLike = ServerTag | SupportedTags;
declare function getTagAttribute(tag: TagLike): string;
declare function getTagKey(tag: TagLike): string;
//#endregion
export { AllHeadTags, Head, HeadTags, Meta, SupportedTags, TagProps, Title, addMeta, getTagAttribute, getTagKey, initializeHeadTags, parseAttributes, resetHeadTags };
//# sourceMappingURL=meta.d.mts.map