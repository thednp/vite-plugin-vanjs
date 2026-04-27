/// <reference types=".." />
// import React from "@vanjs/jsx"
import { expect, test, describe } from "vitest";
import { renderToString } from "@vanjs/server";

describe(`Test server-side JSX`, () => {
  test(`Test regular tags`, async () => {
    const Component = () => {
      return (<div style={{ margin: 0 }}>Hi</div>) as any
    }
    const html = await renderToString(<Component /> as any);

    expect(html).to.contain('Hi');
    expect(html).to.contain('style="margin:0;"');
  });
});
