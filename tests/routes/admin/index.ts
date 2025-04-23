import van from "vanjs-core";
import { A } from "@vanjs/router";

export const Page = () => {
  const { div, h1, p } = van.tags;

  return [
    div(
      { class: "flex h-screen" },
      div(
        { class: "p-4 m-auto text-center" },
        h1({ class: "text-5xl font-bold my-8" }, "Hello Administrator!"),
        p({ class: "my-8" }, "More data required"),
        A({ class: "btn", href: "/admin/not-found"}, "Not found"),
      ),
    ),
  ];
};
