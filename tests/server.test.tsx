// @ts-nocheck
import { expect, test, describe } from "vitest";
import { renderToString } from "@vanjs/server";
// we need to trick typescript into thinking this is React
import React from "@vanjs/jsx";

describe(`Test server-side JSX`, () => {
  test(`Test regular tags`, async () => {
    const Component = () => {
      return <div style={{ margin: 0 }}>Hi</div>
    }
    const html = await renderToString(<Component />);

    expect(html).to.contain('Hi');
    expect(html).to.contain('style="margin:0;"');
  });
});
