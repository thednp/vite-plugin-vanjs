import { RouterState } from "@vanjs/router";
import van, { ChildDom } from "vanjs-core";

export const route = {
  preload: async (params: RouterState["params"]) => {
    // in most cases you may want to enforce user access control
    console.log('Main Layout preload triggered', params);
  },
  load: async (params: RouterState["params"]) => {
    // Load data if needed
    // you might want to cache this data
    console.log('Main Layout load triggered', params);
  }
}

export const Layout = (props?: { children?: ChildDom[] }) => {
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
