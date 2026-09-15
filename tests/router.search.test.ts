// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import { hydrate } from "@vanjs/client";
import {
  Route,
  Router,
  routes,
  routerState,
  setRouterState,
  useRouteData,
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

describe(`Search-only navigations (same pathname, new query)`, () => {
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

  test(`search changes reload data without recreating layout`, async () => {
    routes.length = 0;

    let loadCount = 0;

    const SearchLayout = (props: { children?: any }) => {
      const { div, nav } = van.tags;
      return div(
        nav({ class: "search-side" }, "Search Sidebar"),
        div({ class: "search-content" }, props.children),
      );
    };

    const SearchPage = () => {
      const { div, h1 } = van.tags;
      const data = useRouteData() as { q: string } | undefined;
      return div(h1(`Results ${data?.q ?? "none"}`));
    };

    Route({
      path: "/s-a",
      component: lazyWithLayouts(
        [{ path: "/layout/search", component: SearchLayout }],
        SearchPage,
        undefined,
        async () => {
          loadCount++;
          const q =
            new URLSearchParams(routerState.searchParams).get("q") || "none";
          if (q === "slow") {
            await new Promise((res) => setTimeout(res, 40));
          }
          return { q };
        },
      ),
    });

    setRouterState("/s-a");
    document.body.innerHTML = `<main id="search-main" data-root=""></main>`;
    const main = document.getElementById("search-main") as HTMLElement;

    const App = () => Router({ id: "search-main" });
    hydrate(main, App);

    expect(await waitForText(main, "Results none")).to.contain(
      "Results none",
    );
    expect(loadCount).to.equal(1);

    // Overlapping search navigations: the slow one goes stale mid-lifecycle
    // and must never render over the fresh results.
    setRouterState("/s-a?q=slow");
    await new Promise((res) => setTimeout(res, 10));
    setRouterState("/s-a?q=fast");

    expect(await waitForText(main, "Results fast")).to.contain(
      "Results fast",
    );
    await new Promise((res) => setTimeout(res, 80));

    expect(main.innerHTML).to.contain("Search Sidebar");
    expect(main.innerHTML).to.not.contain("Results slow");
    expect(main.innerHTML).to.not.contain("undefined");
    expect(loadCount).to.equal(3);
  });

  test(`stale SPA navigation never renders over fresh results`, async () => {
    routes.length = 0;

    const SpLayout = (props: { children?: any }) => {
      const { div, nav } = van.tags;
      return div(
        nav({ class: "sp-side" }, "Sp Sidebar"),
        div({ class: "sp-content" }, props.children),
      );
    };

    const SpPage = () => {
      const { div, h1 } = van.tags;
      const data = useRouteData() as { q: string } | undefined;
      return div(h1(`Sp Results ${data?.q ?? "none"}`));
    };

    Route({
      path: "/sp-a",
      component: lazyWithLayouts(
        [{ path: "/layout/sp", component: SpLayout }],
        SpPage,
        undefined,
        async () => {
          const q =
            new URLSearchParams(routerState.searchParams).get("q") || "none";
          if (q === "slow") {
            await new Promise((res) => setTimeout(res, 40));
          }
          return { q };
        },
      ),
    });

    // No data-root element: pure SPA path
    setRouterState("/sp-a");
    document.body.innerHTML = "";
    van.add(document.body, Router());

    expect(await waitForText(document.body, "Sp Results none")).to.contain(
      "Sp Results none",
    );

    setRouterState("/sp-a?q=slow");
    await new Promise((res) => setTimeout(res, 10));
    setRouterState("/sp-a?q=fast");

    expect(await waitForText(document.body, "Sp Results fast")).to.contain(
      "Sp Results fast",
    );
    await new Promise((res) => setTimeout(res, 80));

    expect(document.body.innerHTML).to.contain("Sp Sidebar");
    expect(document.body.innerHTML).to.not.contain("Sp Results slow");
    expect(document.body.innerHTML).to.not.contain("undefined");
  });
});
