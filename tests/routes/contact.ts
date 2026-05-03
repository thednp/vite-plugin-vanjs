import van from "vanjs-core";
import { Meta, Title } from "@vanjs/meta";
import { navigate, A, routerState } from "@vanjs/router";

export const route = {
  preload: async () => {
    console.log('Contact preload triggered', routerState.params);
  },
  load: async () => {
    console.log('Contact load triggered', routerState.params);
  }
}

export const Page = () => {
  const { div, h1, p, button } = van.tags;
  Title("Contact Page");
  Meta({ name: "description", content: "Contact description" });
  return [
    div(
      { class: "flex h-screen" },
      div( 
        { class: "container mx-auto p-4" },
        h1({ class: "text-5xl font-bold my-8" }, "Contact"),
        p({ class: "mb-4" }, "This is the contact page"),
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
