import type { RouteEntry } from "../../src/router";
import van from "../../src/setup/van";
import { DOMElement } from "../../src/types/types";

export const route = {
  preload: async (params: RouteEntry["params"]) => {
    // in most cases you may want to enforce user access control
    console.log('Main Layout preload triggered', params);
  },
  load: async (params: RouteEntry["params"]) => {
    // Load data if needed
    // you might want to cache this data
    console.log('Main Layout load triggered', params);
  }
}

export const Layout = (props?: { children?: DOMElement[] }) => {
  const { div, h3 } = van.tags;

  return [
    div({ class: "root-layout" },
      div({ class: "root-inner" },
        h3("This is app main layout"),
        props?.children
      )
    )
  ];
};
