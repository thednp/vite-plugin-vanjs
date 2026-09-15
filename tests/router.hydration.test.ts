// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import {
  lazy,
  Route,
  Router,
  routerState,
  routes,
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

describe(`Test hydration router`, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.body.removeAttribute("data-root");
    document.body.removeAttribute("data-h");
    document.head.innerHTML = "";
  });

  const waitForText = async (el: HTMLElement, text: string, timeout = 2000) => {
    const started = Date.now();
    while (!el.innerHTML.includes(text) && Date.now() - started < timeout) {
      await new Promise((res) => setTimeout(res, 10));
    }
    return el.innerText;
  };

  test(`Test hydrated root`, async () => {
    routes.length = 0;
    Route({
      path: "/",
      component: () => {
        const { div, h1 } = van.tags;
        return div(h1("Hydrated Home!"));
      },
    });
    Route({
      path: "/info",
      component: lazy(() => import("./routes/(root)/info.ts")),
    });

    setRouterState("/");
    (globalThis as any).__DATA_CACHE = {
      "/": { "": { data: "from-ssr", error: null, timestamp: Date.now() } },
    };
    // hydrating a server rendered root
    document.body.innerHTML = `<main data-root=""></main>`;

    const App = Router({ id: "app-root", "data-attr": undefined } as never);
    // the data cache is hydrated before any component renders
    expect(useRouteData()).to.equal("from-ssr");

    const wrapper = await (App as any)() as HTMLElement;
    expect(wrapper.tagName).to.equal("MAIN");
    expect(wrapper.getAttribute("id")).to.equal("app-root");
    expect(wrapper.hasAttribute("data-attr")).to.equal(false);
    expect(await waitForText(wrapper, "Hydrated Home!")).to.contain(
      "Hydrated Home!",
    );

    // the hydrated root reacts to route changes
    setRouterState("/info");
    expect(await waitForText(wrapper, "Info")).to.contain("Info");

    // no matching route and no catch-all
    setRouterState("/nowhere");
    expect(await waitForText(wrapper, "No Route Found")).to.contain(
      "No Route Found",
    );

    // the popstate listener keeps the router state in sync
    globalThis.history.pushState({}, "", "/info?query=1");
    globalThis.dispatchEvent(new Event("popstate"));
    expect(routerState.pathname).to.equal("/info");
    expect(routerState.searchParams).to.equal("query=1");

    expect(await waitForText(wrapper, "Info")).to.contain("Info");

    delete (globalThis as any).__DATA_CACHE;
  });

  test(`Test hydrated layout route navigation`, async () => {
    routes.length = 0;

    const RootLayout = (props: { children?: any }) => {
      const { div, nav } = van.tags;
      return div(
        nav({ class: "root-nav" }, "Root Nav"),
        div({ class: "root-content" }, props.children),
      );
    };

    const HomePage = () => {
      const { div, h1 } = van.tags;
      return div(h1("Home Page"));
    };

    const AboutPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("About Page"));
    };

    Route({
      path: "/",
      component: lazyWithLayouts(
        [{ path: "/layout/root", component: RootLayout }],
        HomePage,
      ),
    });

    Route({
      path: "/about",
      component: lazyWithLayouts(
        [{ path: "/layout/root", component: RootLayout }],
        AboutPage,
      ),
    });

    setRouterState("/");
    document.body.innerHTML = `<main data-root=""></main>`;

    const App = Router();
    const wrapper = await (App as any)() as HTMLElement;
    expect(await waitForText(wrapper, "Root Nav")).to.contain("Root Nav");
    expect(await waitForText(wrapper, "Home Page")).to.contain("Home Page");

    setRouterState("/about");
    expect(await waitForText(wrapper, "About Page")).to.contain("About Page");
    expect(await waitForText(wrapper, "Root Nav")).to.contain("Root Nav");
  });
});
