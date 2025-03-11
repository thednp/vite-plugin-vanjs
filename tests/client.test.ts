// @vitest-environment happy-dom
import van from 'vanjs-core'
import * as vanX from 'vanjs-ext'
import { expect, test, describe, beforeEach } from "vitest";
import { hydrate } from "@vanjs/client";
import { Head, Title, Meta, Script, Style, Link, addMeta, resetHeadTags, initializeHeadTags, SupportedTags } from "@vanjs/meta";
import { Router, Route, lazy, A, setRouterState, routerState, navigate, unwrap } from "@vanjs/router";

describe(`Test client-side meta`, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
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
    const obj = { a: 1, b: 2 }

    expect(reactive(obj).a).to.equal(1);
    expect(reactive(obj).b).to.equal(2);
  })

  test("Test hydrate", async () => {
    const { div, h1 } = van.tags;
    const Page = () => {
      return div(
        h1('Hello VanJS')
      );
    };

    van.hydrate(document.body, body => hydrate(body, Page()));
    // console.log(document.body.innerText)

    expect(document.body.innerText).to.contain('Hello VanJS')
  })

  test("Test router no route set", async () => {
    van.add(document.body, Router() as HTMLElement);

    // set router state
    navigate('/nowhere', { replace: true });

    expect(document.body.innerText).to.contain('404');
  });

  test("Test router", async () => {
    const Anchor = A({ href: '/test/1?query=1' }, 'Go To Test Page');
    const HomeAnchor = A({ href: '/' }, 'Go Home');
    Route({
      path: '/',
      component: () => {
        const { div, h1 } = van.tags;
        return div(
          h1("Hello VanJS!"),
          Anchor,
          HomeAnchor
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
      component: lazy(() => import('./TestPage.ts'))
    });
  
    Route({
      path: '/test/:someParam',
      component: lazy(() => import('./TestPage.ts'))
    });

    setRouterState('/');
    await new Promise(res => setTimeout(res, 17));
    
    van.hydrate(document.body, (body) => {
      // Router();
      hydrate(body, Router())
      // Router()
      // .then(res => {
      //   const children = Array.from((res as HTMLElement)?.children) as HTMLElement[];
      //   console.log({children})
      //   hydrate(dom, children);
      //   // return children;
      // });
      return body;
    });

    await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML });

    Anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await new Promise(res => setTimeout(res, 17));

    // set router state
    Anchor.click();
    await new Promise(res => setTimeout(res, 17));
    setRouterState('/test');

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/test');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    await new Promise(res => setTimeout(res, 17));
    console.log({ html: document.body.innerHTML });

    expect(document.body.innerHTML).to.contain('<h1>Hello VanJS!</h1>');

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
    expect(document.body.innerHTML).to.contain('<h1>Hello VanJS!</h1>');
  })
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
    const Page4 = async () => {
      return [
        h1('Hello VanJS'),
        div('some div 4')
      ];
    };
    // console.log(div( ...Array.from((unwrap(Page1()) as HTMLElement).children) ));
    expect(div({}, ...Array.from((unwrap(Page1()) as HTMLElement).children) ).innerHTML).to.contain('some div 1');
    expect(div({}, ...Array.from((unwrap(Page2()) as HTMLElement).children) ).innerHTML).to.contain('some div 2');
    expect(div({}, ...Array.from((unwrap(Page3()) as HTMLElement).children) ).innerHTML).to.contain('some div 3');
    
    const testDiv = hydrate(div(), Page4());
    await new Promise(res => setTimeout(res, 17))
    expect(testDiv.innerHTML).to.contain('some div 4');

    expect((unwrap([h1('Hello VanJS'), div('some div 5')]) as HTMLElement).innerHTML).to.contain('some div 5');
  })
})
