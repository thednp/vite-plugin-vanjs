declare module "@vanjs/meta" {
  import { type PropsWithKnownKeys } from "vanjs-core";
  import type {
    Element as VanElement,
    TagFunc,
  } from "mini-van-plate/van-plate";

  export const createHeadTags: () => Map<
    string,
    SupportedTags | TagFunc
  >;
  export const getHeadTags: () => Map<
    string,
    SupportedTags | TagFunc
  >;
  export const resetHeadTags: () => void;
  export const initializeHeadTags: () => void;

  export type SupportedTags =
    | HTMLTitleElement
    | HTMLMetaElement
    | HTMLScriptElement
    | HTMLLinkElement
    | HTMLStyleElement;

  export type TagProps = PropsWithKnownKeys<SupportedTags>;

  export type HeadTags = SupportedTags[] | TagFunc[];

  export const addMeta: (tag?: TagProps) => void;

  export const Head: () => () => SupportedTags[];

  export const Title: (
    props: PropsWithKnownKeys<HTMLTitleElement>,
    content?: string,
  ) => null;

  export const Meta: (props: PropsWithKnownKeys<HTMLMetaElement>) => null;

  export const Style: (
    props: PropsWithKnownKeys<HTMLStyleElement>,
    content?: string,
  ) => null;

  export const Link: (props: PropsWithKnownKeys<HTMLLinkElement>) => null;

  export const Script: (
    props: PropsWithKnownKeys<HTMLScriptElement>,
    content?: string,
  ) => null;

  export const parseAttributes: (
    attributeString: string,
  ) => Record<string, string>;

  export const getTagAttribute: (tag: TagProps) => string;

  export const getTagKey: (tag: TagProps) => string;

  export const extractTags: (html: string) => Promise<{ tag: TagFunc<SupportedTags>, props: PropsWithKnownKeys<SupportedTags> }[]>;
}
