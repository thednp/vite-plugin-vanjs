import { isServer } from "../setup/isServer.ts";
import { getTagKey } from "./helpers.ts";
import type { AllHeadTags, SupportedTags } from "./types.d.ts";

const createHeadTags = () => new Map<string, AllHeadTags>();

const getHeadTags = (() => {
  if (isServer) {
    let serverHeadTags: Map<string, AllHeadTags>;
    return () => {
      if (!serverHeadTags) {
        serverHeadTags = createHeadTags();
      }
      return serverHeadTags;
    };
  }
  const clientHeadTags = createHeadTags();
  return () => clientHeadTags;
})();

export function resetHeadTags(): void {
  const tags = getHeadTags();
  tags.clear();
}

export function initializeHeadTags(): void {
  const tags = getHeadTags();
  if (!tags.size && !isServer) {
    Array.from(document.head.children as HTMLCollectionOf<SupportedTags>)
      .forEach((tag) => {
        tags.set(getTagKey(tag), tag);
      });
  }
}

export function addMeta(tag?: SupportedTags | null): void {
  if (!tag) return;
  const tags = getHeadTags();
  const key = getTagKey(tag);
  tags.set(key, tag);
}

export function Head() {
  return () => {
    const tags = getHeadTags();
    return Array.from(tags.values());
  };
}
