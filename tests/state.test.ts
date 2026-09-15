// @vitest-environment happy-dom
import { expect, test, describe, vi, afterEach } from "vitest";
import van from "vanjs-core";
import { microStore } from "@vanjs/router";

describe(`Test microStore`, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test(`Test primitive values`, () => {
    const store = microStore({ text: "value", count: 1, flag: true });
    expect(store.text).to.equal("value");
    expect(store.count).to.equal(1);
    expect(store.flag).to.equal(true);

    store.text = "updated";
    expect(store.text).to.equal("updated");
  });

  test(`Test nested plain objects`, async () => {
    const store = microStore({ nested: { a: 1, b: "two" }, empty: {} });
    expect(store.nested.a).to.equal(1);
    expect(store.nested.b).to.equal("two");
    expect(Object.keys(store.nested)).to.deep.equal(["a", "b"]);
    expect(store.empty).to.deep.equal({});

    // nested properties are reactive
    const doubled = van.derive(() => store.nested.a * 2);
    expect(doubled.val).to.equal(2);

    store.nested.a = 5;
    await new Promise((res) => setTimeout(res, 17));
    expect(store.nested.a).to.equal(5);
    expect(doubled.val).to.equal(10);
  });

  test(`Test unsupported values`, () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = microStore({
      list: [],
      nothing: null,
      missing: undefined,
    });

    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledWith("object is not supported.");
    expect(warn).toHaveBeenCalledWith("undefined is not supported.");
    expect(store.list).toBeUndefined();
    expect(store.nothing).toBeUndefined();
  });
});
