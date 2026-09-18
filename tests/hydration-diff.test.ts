// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import { hydrate, elementsMatch } from "@vanjs/client";

describe("hydration diffing edge cases", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  test(`SSR divergence: mismatched child structures replace children`, () => {
    const old = document.createElement("main");
    old.innerHTML = `<div id="a">old</div>`;
    const newEl = van.tags.div(van.tags.section({ id: "a" }, "new"));

    hydrate(old, newEl);

    expect(old.innerHTML).to.contain("new");
    expect(old.querySelector("section")).toBeTruthy();
    expect(old.querySelector("div")).toBeNull();
  });

  test(`adoptNode divergence: nested child mismatch replaces subtree`, () => {
    const old = document.createElement("main");
    old.innerHTML = `<div class="x"><span>1</span><span>2</span></div>`;
    const newEl = van.tags.div(
      { class: "x" },
      van.tags.span("1"),
    );

    hydrate(old, newEl);

    expect(old.querySelectorAll("span").length).to.equal(1);
    expect(old.innerText).to.contain("1");
    expect(old.innerText).to.not.contain("2");
  });

  test(`keyed element adoption replaces SSR node with client render`, () => {
    const old = document.createElement("main");
    old.innerHTML = `<div><button data-hk>Old</button></div>`;
    const newEl = van.tags.main(van.tags.div(van.tags.button("New")));

    hydrate(old, newEl);

    expect(old.querySelector("button")?.innerText).to.equal("New");
    // hydration keys are stripped after adoption
    expect(old.querySelector("[data-hk]")).toBeNull();
  });

  test(`comment nodes pair as text and skip adoption for non-elements`, () => {
    const old = document.createElement("main");
    old.innerHTML = `<div><!--a--></div>`;
    const newDom = document.createElement("div");
    const inner = document.createElement("div");
    inner.appendChild(document.createComment("a"));
    newDom.appendChild(inner);

    hydrate(old, newDom);

    expect(old.querySelectorAll("div").length).to.equal(1);
    // comment preserved when pairable
    expect(old.querySelector("div")?.firstChild?.textContent).to.equal("a");
  });

  test(`mismatched comment text is not pairable and replaces the subtree`, () => {
    const old = document.createElement("main");
    old.innerHTML = `<div><!--a--></div>`;
    const newDom = document.createElement("main");
    const div = document.createElement("div");
    div.appendChild(document.createComment("b"));
    newDom.appendChild(div);

    hydrate(old, newDom);

    expect(old.querySelector("div")?.firstChild?.textContent).to.equal("b");
  });

  test(`element and comment child nodes never pair up`, () => {
    const old = document.createElement("main");
    old.innerHTML = `<div>old</div>`;
    const newDom = document.createElement("main");
    newDom.appendChild(document.createComment("a"));

    hydrate(old, newDom);

    expect(old.querySelectorAll("div").length).to.equal(0);
    expect(old.firstChild?.nodeType).to.equal(8);
  });

  test(`non-element nodes are never pairable`, () => {
    // old node non-element: processing instruction pairs with nothing
    const old = document.createElement("main");
    old.innerHTML = `<div></div>`;
    old.querySelector("div")!.appendChild(
      document.createProcessingInstruction("xml", "x"),
    );
    const newDom = document.createElement("main");
    const div = document.createElement("div");
    div.appendChild(document.createProcessingInstruction("xml", "x"));
    newDom.appendChild(div);

    hydrate(old, newDom);

    expect(old.querySelector("div")).toBeTruthy();
    expect(old.querySelector("div")?.firstChild?.nodeType).to.equal(7);

    // new node non-element: element/processing instruction diverge
    const old2 = document.createElement("main");
    old2.innerHTML = `<div></div>`;
    const new2 = document.createElement("main");
    new2.appendChild(document.createProcessingInstruction("xml", "y"));

    hydrate(old2, new2);

    expect(old2.querySelector("div")).toBeNull();
    expect(old2.firstChild?.nodeType).to.equal(7);
  });

  test(`stripHydrationKeys removes data-hk from root and descendants`, () => {
    const old = document.createElement("main");
    old.setAttribute("data-hk", "");
    old.innerHTML = `<div data-hk><button data-hk>New</button></div>`;
    const newEl = van.tags.div(
      van.tags.button("New"),
    );

    hydrate(old, newEl);

    expect(old.hasAttribute("data-hk")).to.equal(false);
    expect(old.querySelector("[data-hk]")).toBeNull();
  });

  test(`elementsMatch recurses into hydrated children when deep`, () => {
    const old = document.createElement("div");
    old.innerHTML = `<span data-hk>Hi</span>`;
    const newEl = van.tags.div(van.tags.span("Hi"));

    expect(elementsMatch(old, newEl, true)).to.equal(true);
    // shallow comparison never recurses
    expect(elementsMatch(old, newEl)).to.equal(true);
  });

  test(`elementsMatch reports divergence inside hydrated children`, () => {
    const old = document.createElement("div");
    old.innerHTML = `<span data-hk><b>x</b></span>`;
    const newEl = van.tags.div(van.tags.span());

    expect(elementsMatch(old, newEl, true)).to.equal(false);
  });

  test(`elementsMatch detects hydration keys nested in descendants`, () => {
    const old = document.createElement("div");
    old.innerHTML = `<span><b data-hk>x</b></span>`;
    const newEl = van.tags.div(van.tags.span(van.tags.b("x")));

    expect(elementsMatch(old, newEl, true)).to.equal(true);
  });

  test(`elementsMatch filters empty text nodes on both sides`, () => {
    const old = document.createElement("div");
    old.appendChild(document.createTextNode(""));
    old.appendChild(van.tags.span("Hi"));
    expect(elementsMatch(old, van.tags.div(van.tags.span("Hi")), true)).to
      .equal(true);

    const oldClient = document.createElement("div");
    oldClient.appendChild(van.tags.span("Hi"));
    const newClient = document.createElement("div");
    newClient.appendChild(document.createTextNode(""));
    newClient.appendChild(van.tags.span("Hi"));
    expect(elementsMatch(oldClient, newClient, true)).to.equal(true);
  });

  test(`elementsMatch ignores text-only children without hydration keys`, () => {
    const old = document.createElement("div");
    old.appendChild(document.createTextNode("plain"));
    const newEl = document.createElement("div");
    newEl.appendChild(document.createTextNode("plain"));

    expect(elementsMatch(old, newEl, true)).to.equal(true);
  });

  test(`elementsMatch handles text node children`, () => {
    const old = document.createElement("div");
    old.innerHTML = `<span data-hk>text</span>`;
    const newEl = van.tags.div(van.tags.span("text"));

    const match = elementsMatch(old, newEl, true);
    expect(match).to.equal(true);
  });
});