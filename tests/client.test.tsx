/// <reference types="../" />
// @vitest-environment happy-dom
import van, { type ChildDom, type State } from 'vanjs-core'
import { expect, test, describe } from "vitest";
import { A } from "@vanjs/router"

describe(`Test client-side JSX`, () => {
  test(`Test regular tags`, async () => {
    const spanRef = van.state<{ current: HTMLSpanElement }>() ;
    const className = van.state('one');
    const spanPadding = van.state('0px')
    const spanStyle = { margin: '0', padding: spanPadding } as unknown as JSX.CSSProperties;
    const divData = () => 'yes';
    const myButton = (
      <button
        id="my-button"
        onClick={async () => className.val += " two"}
        data-test={true}
        style="border: 1px solid red"
        class={className}
        >
          Click Me
      </button>
    ) as HTMLButtonElement;

    const myDiv = (
      <div
        id="my-div"
        data-attr={divData}
        data-test={false}
        style={() => "margin: 0"}
        class={className}
        >
          <span ref={spanRef} style={spanStyle}>Hi</span> VanJS
          <A href="/">Test Link</A>
      </div>
    );

    const Component = () => {
      return [
        myButton,
        myDiv
      ];
    }

    van.add(document.body, <Component /> as HTMLElement[]);

    expect(document.body.innerText).to.contain('Click Me');

    myButton.click();
    await new Promise(res => setTimeout(res, 17));
    expect(myButton.className).to.contain('two');
    expect(spanRef?.val?.current.tagName).toEqual('SPAN');
  });

  test(`Test SVG`, async () => {
    const svg = <svg width="100" height="100">
    <circle cx="50" cy="50" r="40" fill="blue" />
  </svg>
    const svgWithSVGNS = <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="blue" />
  </svg>

    expect((svg as SVGAElement).getAttribute("width")).toEqual("100");
    expect((svgWithSVGNS as SVGAElement).getAttribute("xmlns")).toEqual("http://www.w3.org/2000/svg");

  });

  test(`Test fragment`, async () => {
    const Component = () => {
      return (
        <>
          <h1>Hi VanJS!</h1>
          <p>This is a paragraph</p>
        </>
      );
    }

    van.add(document.body, <Component /> as ChildDom);
    expect(document.body.innerText).to.contain("Hi VanJS!");
  });
});
