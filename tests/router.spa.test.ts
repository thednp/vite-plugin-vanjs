// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import { Route, Router, routerState, routes, setRouterState, lazy } from "@vanjs/router";

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

describe(`Test SPA router`, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.body.removeAttribute("data-root");
    document.body.removeAttribute("data-h");
    document.head.innerHTML = "";
  });

  test(`Test no route found on navigation`, async () => {
    routes.length = 0;
    Route({
      path: "/",
      component: () => {
        const { div, h1 } = van.tags;
        return div(h1("SPA Home!"));
      },
    });

    setRouterState("/");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 17));
    expect(document.body.innerText).to.contain("SPA Home!");

    // without a catch-all route the fallback is rendered
    setRouterState("/nowhere");
    expect(routerState.pathname).to.equal("/nowhere");
    await new Promise((res) => setTimeout(res, 17));
    expect(document.body.innerHTML).to.contain("No Route Found");
  });

  test(`Test layout chain - sibling pages share layout`, async () => {
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
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Root Nav");
    expect(document.body.innerText).to.contain("Home Page");

    // Navigate to about — same layout, different leaf
    setRouterState("/about");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Root Nav");
    expect(document.body.innerText).to.contain("About Page");
    expect(document.body.innerText).not.to.contain("Home Page");

    // Navigate back — same layout, different leaf
    setRouterState("/");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Home Page");
    expect(document.body.innerText).not.to.contain("About Page");
  });

  test(`Test layout chain - different layouts`, async () => {
    routes.length = 0;

    const AdminLayout = (props: { children?: any }) => {
      const { div, nav } = van.tags;
      return div(
        nav({ class: "admin-nav" }, "Admin Nav"),
        div({ class: "admin-content" }, props.children),
      );
    };

    const UserLayout = (props: { children?: any }) => {
      const { div, nav } = van.tags;
      return div(
        nav({ class: "user-nav" }, "User Nav"),
        div({ class: "user-content" }, props.children),
      );
    };

    const AdminPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("Admin Page"));
    };

    const UserPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("User Page"));
    };

    Route({
      path: "/admin",
      component: lazyWithLayouts(
        [{ path: "/layout/admin", component: AdminLayout }],
        AdminPage,
      ),
    });

    Route({
      path: "/user",
      component: lazyWithLayouts(
        [{ path: "/layout/user", component: UserLayout }],
        UserPage,
      ),
    });

    setRouterState("/admin");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Admin Nav");
    expect(document.body.innerText).to.contain("Admin Page");

    // Navigate to user — different layout
    setRouterState("/user");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("User Nav");
    expect(document.body.innerText).to.contain("User Page");
    expect(document.body.innerText).not.to.contain("Admin");
  });

  test(`Test layout chain - nested layouts`, async () => {
    routes.length = 0;

    const OuterLayout = (props: { children?: any }) => {
      const { div } = van.tags;
      return div({ class: "outer" }, "OUTER:", props.children);
    };

    const InnerLayout = (props: { children?: any }) => {
      const { div } = van.tags;
      return div({ class: "inner" }, "INNER:", props.children);
    };

    const PageA = () => {
      const { div } = van.tags;
      return div("PageA");
    };

    const PageB = () => {
      const { div } = van.tags;
      return div("PageB");
    };

    const PageC = () => {
      const { div } = van.tags;
      return div("PageC");
    };

    Route({
      path: "/a",
      component: lazyWithLayouts(
        [
          { path: "/layout/outer", component: OuterLayout },
          { path: "/layout/inner", component: InnerLayout },
        ],
        PageA,
      ),
    });

    Route({
      path: "/b",
      component: lazyWithLayouts(
        [
          { path: "/layout/outer", component: OuterLayout },
          { path: "/layout/inner", component: InnerLayout },
        ],
        PageB,
      ),
    });

    Route({
      path: "/c",
      component: lazyWithLayouts(
        [{ path: "/layout/outer", component: OuterLayout }],
        PageC,
      ),
    });

    // Start with nested layouts
    setRouterState("/a");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("OUTER:");
    expect(document.body.innerText).to.contain("INNER:");
    expect(document.body.innerText).to.contain("PageA");

    // Navigate to /b — same layouts, different leaf
    setRouterState("/b");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("OUTER:");
    expect(document.body.innerText).to.contain("INNER:");
    expect(document.body.innerText).to.contain("PageB");

    // Navigate to /c — outer layout shared, inner layout dropped
    setRouterState("/c");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("OUTER:");
    expect(document.body.innerText).to.contain("PageC");

    // Navigate back to /a — layouts grow (partial prefix match)
    setRouterState("/a");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("OUTER:");
    expect(document.body.innerText).to.contain("INNER:");
    expect(document.body.innerText).to.contain("PageA");
  });

  test(`Test navigate from layout route to non-layout route`, async () => {
    routes.length = 0;

    const RootLayout = (props: { children?: any }) => {
      const { div } = van.tags;
      return div({ class: "root" }, "ROOT:", props.children);
    };

    const HomePage = () => {
      const { div, h1 } = van.tags;
      return div(h1("Home Page"));
    };

    Route({
      path: "/",
      component: lazyWithLayouts(
        [{ path: "/layout/root", component: RootLayout }],
        HomePage,
      ),
    });

    Route({
      path: "/contact",
      component: () => {
        const { div, h1 } = van.tags;
        return div(h1("Contact Page"));
      },
    });

    // Start with layout
    setRouterState("/");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("ROOT:");
    expect(document.body.innerText).to.contain("Home Page");

    // Navigate to non-layout route
    setRouterState("/contact");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Contact Page");
    expect(document.body.innerText).not.to.contain("ROOT:");
  });

  test(`Test navigate from non-layout route to layout route`, async () => {
    routes.length = 0;

    const RootLayout = (props: { children?: any }) => {
      const { div } = van.tags;
      return div({ class: "root" }, "ROOT:", props.children);
    };

    const AboutPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("About Page"));
    };

    Route({
      path: "/contact",
      component: () => {
        const { div, h1 } = van.tags;
        return div(h1("Contact Page"));
      },
    });

    Route({
      path: "/about",
      component: lazyWithLayouts(
        [{ path: "/layout/root", component: RootLayout }],
        AboutPage,
      ),
    });

    // Start with non-layout
    setRouterState("/contact");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Contact Page");

    // Navigate to layout route
    setRouterState("/about");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("ROOT:");
    expect(document.body.innerText).to.contain("About Page");
  });

  test(`Test layout chain with empty layouts uses leaf only`, async () => {
    routes.length = 0;

    const LeafOnly = () => {
      const { div, h1 } = van.tags;
      return div(h1("Leaf Only Page"));
    };

    const OtherLeaf = () => {
      const { div, h1 } = van.tags;
      return div(h1("Other Leaf Page"));
    };

    Route({
      path: "/leaf-a",
      component: lazyWithLayouts([], LeafOnly),
    });

    Route({
      path: "/leaf-b",
      component: lazyWithLayouts([], OtherLeaf),
    });

    setRouterState("/leaf-a");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Leaf Only Page");

    setRouterState("/leaf-b");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Other Leaf Page");
    expect(document.body.innerText).not.to.contain("Leaf Only Page");
  });

  test(`Test rapid navigation triggers race condition guard`, async () => {
    routes.length = 0;

    const SlowPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("Slow Page"));
    };

    const FastPage = () => {
      const { div, h1 } = van.tags;
      return div(h1("Fast Page"));
    };

    const slowFn = lazyWithLayouts([], SlowPage);
    const fastFn = lazyWithLayouts([], FastPage);

    Route({ path: "/slow", component: slowFn });
    Route({ path: "/fast", component: fastFn });

    setRouterState("/slow");
    van.add(document.body, Router());
    await new Promise((res) => setTimeout(res, 30));

    // Rapidly navigate away — triggers race condition guard
    setRouterState("/fast");
    setRouterState("/slow");
    await new Promise((res) => setTimeout(res, 30));
    expect(document.body.innerText).to.contain("Slow Page");
  });
});
