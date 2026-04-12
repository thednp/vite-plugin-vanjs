import van from "vanjs-core";
import { navigate, A, RouteEntry } from "../../../src/router";

export const route = {
  preload: async (params: RouteEntry["params"]) => {
    // in most cases you may want to enforce user access control
    console.log('About preload triggered', params);
  },
  load: async (params: RouteEntry["params"]) => {
    // Load data if needed
    // you might want to cache this data
    console.log('About load triggered', params);
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
