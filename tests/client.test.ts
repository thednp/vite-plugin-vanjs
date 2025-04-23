// @vitest-environment happy-dom
import { expect, test, describe, beforeEach } from "vitest";
import PATH from "node:path";
import process from "node:process";
import van from '@vanjs/van';
import * as vanX from 'vanjs-ext';
import vanXDefault from "@vanjs/vanX";
import { hydrate } from "@vanjs/client";
import { Head, Title, Meta, Script, Style, Link, addMeta, resetHeadTags, initializeHeadTags, SupportedTags } from "@vanjs/meta";
import { Router, Route, lazy, A, setRouterState, routerState, navigate, routes, unwrap } from "@vanjs/router";
import { Layout } from "./routes/(root).ts";
import { Page as IndexPage } from "./routes/(root)/index.ts";
import { Page as ContactPage } from "./routes/contact.ts";
import { Page as InfoPage } from "./routes/(root)/info.ts";
const styleUrl = PATH.resolve(process.cwd(), "tests", 'test-style.css');
const scriptUrl = PATH.resolve(process.cwd(), "tests", 'test-script.js');
const script1Url = PATH.resolve(process.cwd(), "tests", 'test-script-1.js');

describe(`Test client-side`, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  })

  test(`Test meta tags`, () => {
    initializeHeadTags();
    const defaultHead = () => [
      Title('Sample title'),
      Meta({ name: "description", content: 'Sample description' }),
      Script({ id: "my-script" }, "// hello from vanjs 1"),
      Script("// hello from vanjs 2"),
      Link({ href: "/some-url.css" }),
      Style({ id: "my-style" }, "p { line-height: 1.5 }"),
      Style("p { font-weight: normal }"),
    ]
    defaultHead();
    const headTags = Head() as unknown as (() => SupportedTags[]);
    const allTags = headTags() as SupportedTags[];

    expect(allTags).to.have.length(7);
    expect(allTags[0].tagName).to.equal("TITLE");
    expect(allTags[0].innerText).to.equal("Sample title");
    expect(allTags[1].tagName).to.equal("META");
    expect(allTags[1].getAttribute('content')).to.equal("Sample description");
    expect(allTags[2].tagName).to.equal("SCRIPT")
    expect(allTags[2].innerText).to.equal("// hello from vanjs 1");
    expect(allTags[2].getAttribute('id')).to.equal("my-script");
    expect(allTags[3].tagName).to.equal("SCRIPT")
    expect(allTags[3].innerText).to.equal("// hello from vanjs 2");
    expect(allTags[4].tagName).to.equal("LINK");
    expect(allTags[4].getAttribute('href')).to.equal("/some-url.css");
    expect(allTags[5].tagName).to.equal("STYLE")
    expect(allTags[5].innerText).to.contain("line-height");
    expect(allTags[5].getAttribute('id')).to.equal("my-style");
    expect(allTags[6].tagName).to.equal("STYLE");
    expect(allTags[6].innerText).to.contain("font-weight");
    
    // override title
    const Page = () => {
      // initialize again
      resetHeadTags();

      // add some dummy tags for testing purpose    
      document.head.append(van.tags.meta({ name: "viewport", content: 'width=device-width, initial-scale=1' }));

      initializeHeadTags();
      return [Title('Sample title updated')];
    };
    Page();
    const updatedTags = headTags() ;
    expect((updatedTags[1] as HTMLElement).tagName).to.equal("TITLE");
    expect((updatedTags[1] as HTMLElement).innerText).to.equal("Sample title updated");
    // cover undefined case
    addMeta();
  });

  test("Test setup", async () => {
    const { reactive } = vanX;
    const { a } = van.tags;
    const { svg, path } = van.tags("http://www.w3.org/2000/svg");

    const obj = { a: 1, b: 2 };
    const Anchor = a({ href: "/contact", onclick: () => console.log("clicked") });
    const Icon = svg({
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        width: "32", height: "32",
        stroke: "currentColor", "stroke-width": "1", "stroke-linecap": "round", "stroke-linejoin": "round",
        class: "text-stone-500 mb-4"
      },
      path({"d": "M5 12h14"}),
      path({"d": "m12 5 7 7-7 7"}),
    );

    // console.log({ Anchor, Icon })
    expect(vanXDefault.default).toBeDefined()
    expect(reactive(obj).a).to.equal(1);
    expect(reactive(obj).b).to.equal(2);
    expect(Anchor.getAttribute("onclick")).toBeNull();
    expect(Anchor.hasAttribute("data-hk")).toEqual(true);
    expect(Icon.getAttribute("xmlns")).toEqual("http://www.w3.org/2000/svg");
  })

  test("Test hydrate", async () => {
    const { head, body, div, h1, style, script, link, title } = van.tags;
    const docHead = head({ "data-h": "" });
    const docBody = body({ class: "main", id: "main", "data-root": ""});

    // document.head.replaceChildren();
    const Page = () => {
      return div(
        h1('Hello VanJS')
      );
    };
    const PageAsync = async () => {
      return [
        h1('Hello VanJS'),
        div('some div 4')
      ];
    };
    const PageAsync1 = async () => {
      return [
        h1('Hello VanJS 1'),
        div('some div 5')
      ];
    };
    const Head = () => {
      return [
        title("Sample Title"),
        link({rel: "stylesheet", href: styleUrl}),
        style({id: "test-style"}, "p {margin: 0}"),
        script({src: scriptUrl, type: "module"}),
      ]
    }
    const Head1 = () => {
      return [
        title("Sample Title 1"),
        link({rel: "stylesheet", href: styleUrl}),
        style({id: "test-style"}, "p {margin: 0}"),
        style({id: "test-style1"}, "ul {margin: 0}"),
        script({src: script1Url, type: "module"}),
      ]
    };

    // hydrate with async content
    let testDiv = hydrate(div(), PageAsync());
    await new Promise(res => setTimeout(res, 17))
    expect(testDiv.innerHTML).to.contain('some div 4');
    testDiv = hydrate(testDiv, PageAsync1());
    await new Promise(res => setTimeout(res, 17))
    expect(testDiv.innerHTML).to.contain('some div 5');
    expect(testDiv.hasAttribute("data-h")).toBeTruthy();

    // hydrate head
    van.hydrate(docHead, head => hydrate(head, Head()));
    expect(docHead.children.length).toEqual(4);

    van.hydrate(docHead, head => hydrate(head, Head1()));
    expect(docHead.children.length).toEqual(7);

    van.hydrate(docHead, head => hydrate(head, Head()));
    expect(docHead.children.length).toEqual(8);

    // hydrate root
    van.hydrate(docBody, body => hydrate(body, Page()));
    expect(docBody.innerText).to.contain('Hello VanJS');
    expect(docBody.hasAttribute("data-h")).toBeTruthy();

    // test hydration with diffing
    docBody.removeAttribute("data-h");
    let oldBody = docBody.cloneNode() as HTMLElement;
    let newBody = van.add(oldBody.cloneNode() as HTMLElement, Layout({ children: IndexPage() }));
    // console.log('index', {oldBody: oldBody.outerHTML, newBody: newBody.outerHTML});
    van.hydrate(oldBody, body => hydrate(body, newBody));
    expect(oldBody.innerText).to.contain('Hello VanJS');

    // test initial hydration
    oldBody.removeAttribute("data-h");
    newBody = van.add(oldBody.cloneNode() as HTMLElement, Layout({ children: IndexPage() }));
    // console.log('index', {oldBody: oldBody.outerHTML, newBody: newBody.outerHTML});
    van.hydrate(oldBody, body => hydrate(body, newBody));
    expect(oldBody.innerText).to.contain('Hello VanJS');
    // console.log("index\n", docBody.outerHTML);
    
    // test non-initial hydration
    newBody = van.add(oldBody.cloneNode() as HTMLElement, Layout({ children: ContactPage() }));
    // console.log('contact', {oldBody: oldBody.outerHTML, newBody: newBody.outerHTML});
    van.hydrate(oldBody, body => hydrate(body, newBody));
    expect(oldBody.innerText).to.contain('Contact');
    // console.log("\ncontact\n", docBody.outerHTML);
    
    // oldBody.removeAttribute("data-h");
    newBody = van.add(oldBody.cloneNode() as HTMLElement, Layout({ children: InfoPage() }));
    // console.log("info", {oldBody: oldBody.outerHTML, newBody: newBody.outerHTML});
    van.hydrate(oldBody as HTMLElement, body => hydrate(body, newBody));
    expect(oldBody.innerText).to.contain('Info');
    // console.log("\ninfo\n", docBody.outerHTML);
  })

  test("Test router no route set", async () => {
    // reset routes from file-system router
    routes.length = 0;
    van.add(document.body, Router() as HTMLElement);

    // set router state
    navigate('/nowhere', { replace: true });

    expect(document.body.innerText).to.contain('No Route Found');
  });

  test("Test router", async () => {
    // reset routes from file-system router
    routes.length = 0;
    const Anchor = A({
      href: '/test/1?query=1',
      class: "test",
      onclick: () => { console.log("test click")}
    }, 'Go To Test Page');
    // const Dummy = A();
    const HomeAnchor = A({ href: '/' }, 'Go Home');
    Route({
      path: '/',
      component: () => {
        const { div, h1 } = van.tags;
        return div(
          h1("Hello VanJS!"),
          Anchor,
          HomeAnchor,
          // Dummy
        );
      }
    });
    Route({
      path: '*',
      component: () => {
        const { div, h1 } = van.tags;
        return div(
          h1("Not found!"),
          Anchor,
          HomeAnchor
        );
      }
    });
    Route({
      path: '/test',
      component: lazy(() => import('./routes/(root)/index.ts'))
    });
  
    Route({
      path: '/test/:someParam',
      component: lazy(() => import('./routes/(root)/index.ts'))
    });

    setRouterState('/');
    await new Promise(res => setTimeout(res, 17));
    
    van.add(document.body, () => Router())

    await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML });

    Anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise(res => setTimeout(res, 17));

    // set router state
    Anchor.click();
    await new Promise(res => setTimeout(res, 17));
    setRouterState('/test/'); // edge case for coverage

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/test/');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    // await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML });
    
    await new Promise(res => setTimeout(res, 17));
    expect(document.body.innerHTML).to.contain('Hello VanJS!');

    // set router state
    setRouterState('/not-there');

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/not-there');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML })
    expect(document.body.innerHTML).to.contain('Not found!');

    // set router state
    // navigate('/test/1?query=1');
    Anchor.click();

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/test/1');
    expect(routerState.searchParams.val.toString()).to.equal('query=1');
    expect(routerState.params.val).to.deep.equal({ someParam: '1' });

    await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML })
    expect(document.body.innerHTML).to.contain('Hello VanJS!');
  });

  test("Test unwrap", async () => {
    const { div, h1 } = van.tags;
    const Page1 = () => {
      return () => div(
        h1('Hello VanJS'),
        div('some div 1')
      );
    };
    const Page2 = () => {
      return () => [
        h1('Hello VanJS'),
        div('some div 2')
      ];
    };
    const Page3 = () => {
      return [
        h1('Hello VanJS'),
        div('some div 3')
      ];
    };

    // console.log(div( ...Array.from((unwrap(Page1())).children) ));
    expect(div({}, ...Array.from((unwrap(Page1())).children)).innerHTML).to.contain('some div 1');
    expect(div({}, ...Array.from((unwrap(Page2())).children)).innerHTML).to.contain('some div 2');
    expect(div({}, ...Array.from((unwrap(Page3())).children)).innerHTML).to.contain('some div 3');
    // console.log(unwrap(Page3()))
    expect((unwrap(Page3()) ).children.length).toEqual(2);
    expect((unwrap([h1('Hello VanJS'), div('some div 5')])).children.length).toEqual(2);
  })
})
