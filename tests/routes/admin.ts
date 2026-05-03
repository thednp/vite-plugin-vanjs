import van, { ChildDom } from "vanjs-core";
import { routerState } from "@vanjs/router";

export const route = {
  preload: async () => {
    console.log('Admin Layout preload triggered', routerState.params);
  },
  load: async () => {
    console.log('Admin Layout load triggered', routerState.params);
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
