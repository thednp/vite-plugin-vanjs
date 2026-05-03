import van from "vanjs-core";
import { navigate, A, routerState } from "@vanjs/router";

export const route = {
  preload: async () => {
    console.log('About preload triggered', routerState.params);
  },
  load: async () => {
    console.log('About load triggered', routerState.params);
  }
}

export const Page = () => {
  const { div, h1, p, button } = van.tags;

  return [
    div(
      { class: "flex h-screen" },
      div(
        { class: "container mx-auto p-4" },
        h1({ class: "text-5xl font-bold my-8" }, "About"),
        p({ class: "mb-4" }, "This is the about page"),
        button(
          { class: "btn mr-2", onclick: () => navigate("/") },
          "Go home",
        ),
        A(
          { class: "btn",  href: "/not-found" },
          "Not found",
        ),
      ),
    ),
  ];
};
