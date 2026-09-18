// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import van from "@vanjs/van";
import {
  markHydrationComplete,
  resetHydrationState,
  needsHydration,
} from "../setup/helpers.mjs";

describe("setup helpers", () => {
  beforeEach(() => {
    resetHydrationState();
  });

  test(`needsHydration with no props returns falsy`, () => {
    // @ts-expect-error - testing
    expect(needsHydration(undefined)).toBeFalsy();
    expect(needsHydration({})).to.equal(false);
  });

  test(`needsHydration detects event handlers`, () => {
    expect(needsHydration({ onclick: () => {} })).to.equal(true);
  });

  test(`needsHydration detects reactive state values`, () => {
    const s = van.state("hello");
    expect(needsHydration({ value: s })).to.equal(true);
  });

  test(`needsHydration detects state values nested inside a style object`, () => {
    const s = van.state("red");
    const props = { style: { color: s, width: "100%" } };
    expect(needsHydration(props)).to.equal(true);
  });

  test(`needsHydration ignores plain objects without state`, () => {
    expect(needsHydration({ style: { color: "red" }, data: { a: 1 } })).to.equal(false);
  });

  test(`markHydrationComplete short-circuits and resetHydrationState re-enables`, () => {
    const s = van.state("x");
    const props = { onclick: () => {} };

    expect(needsHydration(props)).to.equal(true);
    markHydrationComplete();
    // hydration complete -> never hydrates again
    expect(needsHydration(props)).to.equal(false);
    expect(needsHydration({ value: s })).to.equal(false);

    resetHydrationState();
    expect(needsHydration(props)).to.equal(true);
  });
});