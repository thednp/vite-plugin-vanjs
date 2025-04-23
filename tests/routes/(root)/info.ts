import van from "vanjs-core";
import { navigate, A } from "@vanjs/router";

export const Page = () => {
  const { div, h1, p, button } = van.tags;
  return [
    div(
      { class: "flex h-screen" },
      div(
        { class: "container mx-auto p-4" },
        h1({ class: "text-5xl font-bold my-8" }, "Info"),
        p("This is the info page"),
        button(
          { class: "btn", onclick: () => navigate("/not-found") },
          "Not found",
        ),
        A({ href: "/contact"}, "Contact")
      ),
    ),
  ];
};
