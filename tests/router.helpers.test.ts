// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import {
  executeModule,
  getCacheKey,
  getValue,
  isLazyComponent,
  resolveChildren,
  routerState,
  setRouterState,
} from "@vanjs/router";

describe(`Test router helpers`, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  test(`Test getValue`, () => {
    expect(getValue("/plain")).to.equal("/plain");
    expect(getValue(() => "/from-function")).to.equal("/from-function");
    expect(getValue(van.state("/from-state"))).to.equal("/from-state");
  });

  test(`Test isLazyComponent`, () => {
    expect(isLazyComponent(null)).to.equal(false);
    expect(isLazyComponent({})).to.equal(false);
    expect(isLazyComponent(() => {})).to.equal(false);
    expect(isLazyComponent(async () => ({}))).to.equal(true);
  });

  test(`Test getCacheKey`, () => {
    // params without a search string
    setRouterState("/cache-key", "", { someParam: "1" });
    expect(getCacheKey()).to.equal(`{"someParam":"1"}`);

    // params together with a search string
    setRouterState("/cache-key?query=1", "", { someParam: "1" });
    expect(getCacheKey()).to.equal(`{"someParam":"1"}&query=1`);

    // search string only
    setRouterState("/cache-key?query=1");
    expect(getCacheKey()).to.equal("query=1");

    // empty state
    setRouterState("/cache-key");
    expect(getCacheKey()).to.equal("");
  });

  test(`Test resolveChildren`, () => {
    const { div, h1, span } = van.tags;

    // an array of nodes
    expect(resolveChildren([div("one"), div("two")])).to.have.length(2);

    // a single element
    const element = div(h1("title"), div("child"));
    expect(resolveChildren(element)).to.have.length(2);

    // a component module
    expect(resolveChildren({ component: () => div(span("module")) })).to.have
      .length(1);

    // a module with a non function component
    expect(resolveChildren({ component: element })).to.have.length(2);
  });

  test(`Test executeModule loading guard`, async () => {
    const { div, main, span } = van.tags;
    const wrapper = main();
    const route = {
      path: "/loader",
      component: () =>
        Promise.resolve({
          component: () => div(span("loaded")),
        }),
    };

    const pending = executeModule(route, wrapper);
    // the second call is skipped while the first one is in progress
    const skipped = await executeModule(route, wrapper);

    expect(skipped).toBeUndefined();
    await pending;

    expect(routerState.loading).to.equal(false);
    expect(wrapper.innerHTML).to.contain("loaded");
  });
});
