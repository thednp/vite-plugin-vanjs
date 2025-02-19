import { expect, test, describe } from "vitest";
import { Head, Title, Meta, Script, Style, Link, resetHeadTags } from "@vanjs/meta";
import van from "@vanjs/van";
import vanX from "@vanjs/vanX";
import vanjs from "vite-plugin-vanjs";
import { renderToString, renderPreloadLinks } from "@vanjs/server";
import { Router, Route, lazy, setRouterState, routerState, fixRouteUrl } from "@vanjs/router";

describe(`Test server-side setup, meta & router`, () => {
  test(`Test meta tags`, async () => {
    resetHeadTags();
    const defaultHead = () => [
      Title('Sample title'),
      Meta({ name: "description", content: 'Sample description' }),
      Script({ id: "my-script" }, "// hello from vanjs 1"),
      Script("// hello from vanjs 2"),
      Link({ href: "/some-url.css" }),
      Style({ id: "my-style" }, "p { line-height: 1.5 }"),
      Style("p { font-weight: normal }"),
    ]
    // const App = () => initHead();
    defaultHead();
    // const headTags = Head();
    const allTags = await renderToString(Head());

    expect(allTags).to.contain('<title>Sample title</title>');
    expect(allTags).to.contain('<meta name="description" content="Sample description">');
    expect(allTags).to.contain('<script id="my-script">// hello from vanjs 1</script>');
    expect(allTags).to.contain('<script>// hello from vanjs 2</script>');
    expect(allTags).to.contain('<link href="/some-url.css">');
    expect(allTags).to.contain('<style id="my-style">p { line-height: 1.5 }</style>');
    expect(allTags).to.contain('<style>p { font-weight: normal }</style>');
    expect(await renderToString(true)).to.equal('true');
    expect(await renderToString(1)).to.equal('1');
    expect(await renderToString({ van: '' })).to.equal('');
    expect(await renderToString(new Promise<string>(res => res('hi')))).to.equal('hi');
  });

  test('Test prerendering assets', async () => {
    const manifest = {
      'src/van.js': ['/src/van.js'],
      'setup/van.mjs': ['/src/setup/van.js'],
      'src/app.css': ['/assets/app.css'],
      'src/app.ts': ['/src/app.js'],
      'fancy/src/app.ts': ['src/app.js'],
      'src/assets/image.jpg': ['/assets/img.jpg'],
      'src/assets/image-1.gif': ['/assets/img-1.gif'],
      'src/assets/image-2.jpeg': ['/assets/img-2.jpeg'],
      'src/assets/image-3.png': ['/assets/img-3.png'],
      'src/assets/image-4.webp': ['/assets/img-4.webp'],
      'src/assets/Mona-sans.woff': ['/assets/mona-sans.woff'],
      'src/assets/Mona-sans-2.woff2': ['/assets/mona-sans-2.woff2'],
    };
    const markup = renderPreloadLinks(Object.keys(manifest), manifest);
    // console.log(markup)

    expect(markup).to.contain('<link rel="modulepreload" as="script" crossorigin href="/src/van.js">');
    expect(markup).to.contain('<link rel="modulepreload" as="script" crossorigin href="/src/setup/van.js">');
    expect(markup).to.contain('<link rel="stylesheet" href="/assets/app.css">');
    expect(markup).to.contain('<link rel="modulepreload" as="script" crossorigin href="/src/app.js">');
    expect(markup).to.contain('<link rel="preload" href="/assets/img.jpg" as="image" type="image/jpeg">');
    expect(markup).to.contain('<link rel="preload" href="/assets/img-1.gif" as="image" type="image/gif">');
    expect(markup).to.contain('<link rel="preload" href="/assets/img-2.jpeg" as="image" type="image/jpeg">');
    expect(markup).to.contain('<link rel="preload" href="/assets/img-3.png" as="image" type="image/png">');
    expect(markup).to.contain('<link rel="preload" href="/assets/img-4.webp" as="image" type="image/webp">');

    const mini = {
      'src/van.txt': ['/src/van.txt'],
    }
    const mk = renderPreloadLinks(Object.keys(mini), mini);
    expect(mk).to.equal("");
  });

  test('Test plugin', async () => {
    const plugin = vanjs();
    expect(plugin.name).to.equal('vanjs');
    expect(typeof plugin.config()?.resolve?.alias["@vanjs/setup"]).to.not.equal('undefined');
    const sampleCode = `// test code
import van from "vanjs-core";
import { reactive } from "vanjs-ext";
import { list } from "vanjs-ext";`;
    const transformed = plugin.transform(sampleCode, '/modules/some-path.js');

    expect(transformed.code).to.include('@vanjs/van')
    expect(transformed.code).to.include('@vanjs/vanX')
  });

  test("Test setup", async () => {
    const { reactive } = vanX;
    const obj = { a: 1, b: 2 }

    expect(reactive(obj).a).to.equal(1);
    expect(reactive(obj).b).to.equal(2);
  });

  test("Test router", async () => {
    Route({
      path: '/',
      component: () => {
        const { div, h1 } = van.tags;
        return div(
          h1("Hello VanJS!")
        );
      }
    });
    Route({
      path: '*',
      component: () => {
        const { div, h1 } = van.tags;
        return div(
          h1("Not found!")
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

    // set router state
    setRouterState('/test');

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/test');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML })
    let html = await renderToString(Router());
    expect(html).to.contain('<h1>Hello VanJS!</h1>');

    // set router state
    setRouterState('/not-there');

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/not-there');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    await new Promise(res => setTimeout(res, 17));
    html = await renderToString(Router());
    // console.log({ html: document.body.innerHTML })
    expect(html).to.contain('Not found!');

    // set router state
    setRouterState('/test/1?query=1', undefined, { someParam: '1' });
    // Anchor.click();

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/test/1');
    expect(routerState.searchParams.val.toString()).to.equal('query=1');
    expect(routerState.params.val).to.deep.equal({ someParam: '1' });

    await new Promise(res => setTimeout(res, 17));
    // console.log({ html: document.body.innerHTML })
    html = await renderToString(Router());
    expect(html).to.contain('<h1>Hello VanJS!</h1>');

    expect(fixRouteUrl('')).toEqual("/")
    expect(fixRouteUrl('test')).toEqual("/test")
  })
});
