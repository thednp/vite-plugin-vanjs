/// <reference path="global.d.ts" />
import { type PropsWithKnownKeys } from "vanjs-core";
import { type TagFunc } from "mini-van-plate/van-plate";

export const createHeadTags: () => Map<
  string,
  SupportedTags | TagFunc<SupportedTags>
>;

export const getHeadTags = () =>
  (Map<string, SupportedTags | TagFunc<SupportedTags>>);
export const resetHeadTags: () => void;
export const initializeHeadTags: () => void;

export type SupportedTags =
  | HTMLTitleElement
  | HTMLMetaElement
  | HTMLScriptElement
  | HTMLLinkElement
  | HTMLStyleElement;

export type TagProps = SupportedTags | PropsWithKnownKeys<SupportedTags>;

export type HeadTags = SupportedTags[] | TagFunc<SupportedTags>[];

export const addMeta = (tag: string | TagProps) => null;

export const Head: () => HeadTags;

export const parseAttributes: (
  attributeString: string,
) => Record<string, string>;

export const getTagAttribute: (tag: TagProps) => string;

export const getTagKey: (tag: TagProps) => string;

export const extractTags: (html: string) => Promise<{ tag: TagFunc<SupportedTags>, props: PropsWithKnownKeys<SupportedTags> }[]>;
