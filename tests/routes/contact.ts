import van from "vanjs-core";
import { Meta, Title } from "@vanjs/meta";
import { navigate, A, RouterState } from "@vanjs/router";

export const route = {
  preload: async (params: RouterState["params"]) => {
    // in most cases you may want to enforce user access control
    console.log('Contact preload triggered', params);
  },
  load: async (params: RouterState["params"]) => {
    // Load data if needed
    // you might want to cache this data
    console.log('Contact load triggered', params);
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
