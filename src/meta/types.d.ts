import { type PropsWithKnownKeys } from "vanjs-core";
import { type TagFunc } from "mini-van-plate/van-plate";

export type SupportedTags =
  | HTMLTitleElement
  | HTMLMetaElement;

export type AllHeadTags =
  | HTMLTitleElement
  | HTMLScriptElement
  | HTMLStyleElement
  | HTMLLinkElement
  | HTMLMetaElement;

export type TagProps = SupportedTags | PropsWithKnownKeys<SupportedTags>;

export type HeadTags = AllHeadTags[] | TagFunc[];
