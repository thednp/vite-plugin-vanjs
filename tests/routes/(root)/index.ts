import van from "vanjs-core";
import { type RouteEntry, A } from "../../../src/router";

export const route = {
  preload: async (params?: RouteEntry["params"]) => {
    // in most cases you may want to enforce user access control
    console.log('Home preload triggered', params);
  },
  load: async (params?: RouteEntry["params"]) => {
    // Load data if needed
    // you might want to cache this data
    console.log('Home load triggered', params);
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
