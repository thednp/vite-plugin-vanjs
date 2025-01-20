/// <reference path="global.d.ts" />
import { type PropsWithKnownKeys } from "vanjs-core";
import { type TagFunc } from "mini-van-plate/van-plate";

export type CreateTags = () => Map<
  string,
  SupportedTags | TagFunc<SupportedTags>
>;
export type GetTags = () => Map<string, SupportedTags | TagFunc<SupportedTags>>;
export type ResetTags = () => void;
export type InitializeTags = () => void;

export type SupportedTags =
  | HTMLTitleElement
  | HTMLMetaElement
  | HTMLScriptElement
  | HTMLLinkElement
  | HTMLStyleElement;

export type TagProps = PropsWithKnownKeys<SupportedTags>;

export type HeadTags = SupportedTags[] | TagFunc<SupportedTags>[];

export type AddMeta = (tag: string | TagProps) => null;

export type HeadComp = () => HeadTags;

export type ParseAttributes = (
  attributeString: string,
) => Record<string, string>;

export type GetTagAttribute = (tag: TagProps) => string;

export type GetTagKey = (tag: TagProps) => string;
