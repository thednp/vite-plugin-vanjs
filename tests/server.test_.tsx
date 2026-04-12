// @vitest-environment happy-dom
import { jsx } from "../src/jsx"
import { expect, test, describe } from "vitest";
import { renderToString } from "../src/server";

describe(`Test server-side JSX`, () => {
  test(`Test regular tags`, async () => {
    const Component = () => {
      return jsx("div", { style: { margin: 0 }, children: "Hi" });
      // return <div style={{ margin: 0 }}>Hi</div>
    }
    const html = await renderToString(Component);

    expect(html).to.contain('Hi');
    expect(html).to.contain('style="margin:0;"');
  });
});
