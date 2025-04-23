import van, { ChildDom } from "vanjs-core";
import { type RouterState } from "@vanjs/router";

export const route = {
  preload: async (params: RouterState["params"]) => {
    // in most cases you may want to enforce user access control
    console.log('Admin Layout preload triggered', params);
  },
  load: async (params: RouterState["params"]) => {
    // Load data if needed
    // you might want to cache this data
    console.log('Admin Layout load triggered', params);
  }
}

export const Page = (props?: { children?: ChildDom[] }) => {
  const { div, h3 } = van.tags;
  return [
      div({ class: "admin-layout" },
      div({ class: "admin-inner" },
        h3("This is the admin layout"),
        props?.children
      )
    )
  ];
};
