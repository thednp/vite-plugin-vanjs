import { routerState } from "@vanjs/router";
import van, { ChildDom } from "vanjs-core";

export const route = {
  preload: async () => {
    console.log('Main Layout preload triggered', routerState.params);
  },
  load: async () => {
    console.log('Main Layout load triggered', routerState.params);
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
