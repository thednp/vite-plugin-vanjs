import { isServer } from "../setup/isServer.ts";
import type { SupportedTags } from "./types.d.ts";

export function parseAttributes(
  attributeString: string,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  const attributeRegex = /([a-zA-Z0-9_-]+)(?:="([^"]*?)")?/g;
  let match: RegExpExecArray | null;

  while ((match = attributeRegex.exec(attributeString)) !== null) {
    const name = match[1];
    const value = match[2] ?? "";
    attributes[name] = value;
  }

  return attributes;
}

type ServerTag = { name: string; propsStr: string };
type TagLike = ServerTag | SupportedTags;

export function getTagAttribute(tag: TagLike): string {
  const attributes = [
    "name",
    "property",
    "charset",
    "viewport",
    "media",
    "http-equiv",
    "rel",
    "src",
    "href",
    "id",
  ];

  for (const attr of attributes) {
    const value = isServer
      ? (tag as ServerTag)[attr as keyof ServerTag]
      : (tag as SupportedTags).getAttribute(attr);

    if (value) return value as string;
  }
  return "";
}

export function getTagKey(tag: TagLike): string {
  const normalizedTag = isServer
    ? {
      tagName: (tag as ServerTag).name.toUpperCase(),
      ...parseAttributes((tag as ServerTag).propsStr),
    }
    : { tagName: (tag as SupportedTags).tagName };

  return normalizedTag.tagName +
    (normalizedTag.tagName !== "TITLE" ? `.${getTagAttribute(tag)}` : "");
}
