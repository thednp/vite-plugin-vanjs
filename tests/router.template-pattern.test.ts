// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import { hydrate } from "@vanjs/client";
import {
  Route,
  Router,
  routes,
  setRouterState,
} from "@vanjs/router";

/** Simulate the plugin-generated lazy component with layouts + leaf */
const lazyWithLayouts = (
  layouts: { path: string; component: (...args: any[]) => any }[],
  leaf: () => any,
  preload?: () => Promise<void>,
  load?: () => Promise<void>,
) => {
  const importFn = async () => {
    const component = () => {
      let content: any = leaf();
      for (let k = layouts.length - 1; k >= 0; k--) {
        content = layouts[k].component({ children: content });
      }
      return content;
    };
    return {
      route: { preload, load },
      component,
      layouts,
      leaf,
    };
  };
  (importFn as any).isLazy = true;
  return importFn;
};

describe(`Template pattern (hydrate with App function)`, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  const waitForText = async (el: HTMLElement, text: string, timeout = 2000) => {
    const started = Date.now();
    while (!el.innerHTML.includes(text) && Date.now() - started < timeout) {
      await new Promise((res) => setTimeout(res, 10));
    }
    return el.innerText;
  };

  test(`single Router instance preserves layout across navigations`, async () => {
    routes.length = 0;

    let loadCount = 0;
    const countLoad = async () => {
      loadCount++;
    };

    const Layout = (props: { children?: any }) => {
      const { div, nav } = van.tags;
      return div(
        nav({ class: "tpl-side" }, "Tpl Sidebar"),
        div({ class: "tpl-content" }, props.children),
      );
    };

    const PlainPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("Plain Page"));
    };

    const SinglePageA = () => {
      const { div, h1 } = van.tags;
      return div(h1("Page A"));
    };

    const SinglePageB = () => {
      const { div, h1 } = van.tags;
      return div(h1("Page B"));
    };

    // Real template pages return arrays of nodes, not single elements
    const ArrayPage = () => {
      const { div, h1, p } = van.tags;
      return [div(h1("Array Page"), p("extra node"))];
    };

    Route({ path: "/tpl-plain", component: PlainPage });

    for (
      const [path, leaf] of [
        ["/tpl-a", SinglePageA],
        ["/tpl-b", SinglePageB],
        ["/tpl-c", ArrayPage],
      ] as const
    ) {
      Route({
        path,
        component: lazyWithLayouts(
          [{ path: "/layout/tpl", component: Layout }],
          leaf,
          undefined,
          countLoad,
        ),
      });
    }

    setRouterState("/tpl-plain");
    document.body.innerHTML = `<main id="tpl-main" data-root=""></main>`;
    const main = document.getElementById("tpl-main") as HTMLElement;

    // Template pattern used by all create-vanjs templates:
    // App passed as a function, so hydrate() wraps it in van.derive().
    // If Router() setup reads router state reactively, every navigation
    // re-runs App() and creates a duplicate Router instance.
    const App = () => Router({ id: "tpl-main" });
    hydrate(main, App);

    expect(await waitForText(main, "Plain Page")).to.contain("Plain Page");

    // Full rebuild into a layout route with an array leaf
    setRouterState("/tpl-c");
    expect(await waitForText(main, "Array Page")).to.contain("Array Page");
    expect(await waitForText(main, "extra node")).to.contain("extra node");
    expect(await waitForText(main, "Tpl Sidebar")).to.contain("Tpl Sidebar");
    expect(main.innerHTML).to.not.contain("undefined");
    expect(loadCount).to.equal(1);

    const sidebar = main.querySelector(".tpl-side") as HTMLElement;

    // Shared layout, single-element leaf swap — layout DOM untouched
    setRouterState("/tpl-a");
    expect(await waitForText(main, "Page A")).to.contain("Page A");
    expect(main.querySelector(".tpl-side")).to.equal(sidebar);
    expect(main.innerHTML).to.not.contain("undefined");
    expect(loadCount).to.equal(2);

    setRouterState("/tpl-b");
    expect(await waitForText(main, "Page B")).to.contain("Page B");
    expect(main.querySelector(".tpl-side")).to.equal(sidebar);
    expect(loadCount).to.equal(3);

    // Shared layout, array leaf swap
    setRouterState("/tpl-c");
    expect(await waitForText(main, "Array Page")).to.contain("Array Page");
    expect(await waitForText(main, "extra node")).to.contain("extra node");
    expect(main.querySelector(".tpl-side")).to.equal(sidebar);
    expect(main.innerHTML).to.not.contain("undefined");
    expect(loadCount).to.equal(4);
  });
});
