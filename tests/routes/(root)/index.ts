import van from "vanjs-core";
import { routerState, A } from "@vanjs/router";

export const route = {
  preload: async () => {
    console.log('Home preload triggered', routerState.params);
  },
  load: async () => {
    console.log('Home load triggered', routerState.params);
  }
}

export const Page = () => {
  const { div, h1, p } = van.tags;

  return [
    div(
      { class: "flex h-screen" },
      div(
        { class: "p-4 m-auto text-center" },
        A(
          { href: "/vite", class: "p-4", target: "_blank" },

        ),
        A(
          { href: "/vanjs", class: "p-4", target: "_blank" },
        ),
        h1({ class: "text-5xl font-bold my-8" }, "Hello VanJS!"),
        p({ class: "my-8" }, "Click on the VanJS logo to learn more"),
      ),
    ),
  ];
};
