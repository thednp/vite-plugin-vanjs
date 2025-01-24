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
  export type ResetTags = () => void;
  export type InitializeTags = () => void;

  export type SupportedTags =
    | HTMLTitleElement
    | HTMLMetaElement
    | HTMLScriptElement
    | HTMLLinkElement
    | HTMLStyleElement;

  export type TagProps = PropsWithKnownKeys<SupportedTags>;

  export type HeadTags = SupportedTags[] | TagFunc[];

  export type AddMeta = (tag?: TagProps) => void;

  // export declare const Head: () => () => TagFunc[];
  export declare const Head: () => () => SupportedTags[];
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

  export type ParseAttributes = (
    attributeString: string,
  ) => Record<string, string>;

  export type GetTagAttribute = (tag: TagProps) => string;

  export type GetTagKey = (tag: TagProps) => string;

  export const initializeHeadTags: InitializeTags;
  export const resetHeadTags: ResetTags;
  export const addMeta: AddMeta;
}
