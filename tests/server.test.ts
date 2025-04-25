// @vitest-environment node
import process from "node:process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const toAbsolute = (p:string) => resolve(__dirname, p);

import { expect, test, describe, vi, afterEach } from "vitest";
import { Head, Title, Meta, Script, Style, Link, resetHeadTags } from "@vanjs/meta";
import van from "@vanjs/van";
import vanX from "@vanjs/vanX";
import { type Element as VanElement } from "mini-van-plate/van-plate";
import vanjs from "../plugin/index.mjs";
import { renderToString, renderPreloadLinks } from "@vanjs/server";
import { Router, Route, lazy, setRouterState, routerState, fixRouteUrl, routes } from "@vanjs/router";

describe(`Test SSR`, () => {

  // Mock Vite's internals
  vi.mock('vite', () => ({
    // normalizePath: (path: string) => path.replace(/\\/g, '/'),
    transformWithEsbuild: vi.fn().mockImplementation((code) => 
      Promise.resolve({ 
        code,  // return the same code that was passed
        map: null 
      })
    ),
  }));

  afterEach(async () => {
    process.env.NODE_ENV = "test";
  });

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
      'src/pages/layout.js': [],
      'src/pages/home.js': ['src/pages/layout.js'],
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

    expect(markup).to.contain('<link rel="preload" href="/src/van.js" as="script" crossorigin>');
    expect(markup).to.contain('<link rel="preload" href="/src/setup/van.js" as="script" crossorigin>');
    expect(markup).to.contain('<link rel="preload" href="/assets/app.css" as="style" crossorigin>');
    expect(markup).to.contain('<link rel="preload" href="/src/app.js" as="script" crossorigin>');
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

  test("Test setup", async () => {
    const { reactive } = vanX;
    const { div, a } = van.tags;
    const classString = van.state("sample-class");
    const { svg, path } = van.tags("http://www.w3.org/2000/svg");
    const obj = { a: 1, b: 2 };
    const Div = div("Sample div") as unknown as VanElement;
    const Anchor = a({ href: "/contact", onclick: () => console.log("clicked") }, "Click me") as unknown as VanElement;
    const Anchor1 = a({ href: "/contact", class: classString }, "Click me") as unknown as VanElement;
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
    ) as unknown as VanElement;

    // console.log({Anchor1: Anchor1.render()})
    expect(reactive(obj).a).to.equal(1);
    expect(reactive(obj).b).to.equal(2);
    expect((vanX as typeof vanX & { default: typeof vanX}).default).toBeDefined();

    expect(Div.render()).toContain("Sample div");
    expect(Anchor.render()).not.toContain("onclick");
    expect(Anchor.render()).toContain("data-hk");
    expect(Anchor1.render()).toContain("class");
    expect(Anchor1.render()).toContain("data-hk");
    expect(Icon.render()).toContain("http://www.w3.org/2000/svg");
  });

  test('Test plugin', async () => {
    const plugin = vanjs({
      routesDir: "tests/routes"
    });
    const config = plugin.config();

    // expect(typeof plugin.config()?.resolve?.alias["@vanjs/setup"]).to.not.equal('undefined');
    expect(plugin).toEqual(expect.objectContaining({
      name: 'vanjs',
      enforce: 'pre',
      config: expect.any(Function),
      configResolved: expect.any(Function),
      configureServer: expect.any(Function),
      resolveId: expect.any(Function),
      load: expect.any(Function),
    }));

    // coverage
    plugin.configResolved({ mode: "test", root: toAbsolute("..") } as any);
    // virtual:module 
    expect(plugin.resolveId('virtual:@vanjs/routes', undefined, { ssr: false })).toEqual('\0virtual:@vanjs/routes');
    // resolve modules development
    process.env.NODE_ENV = 'development';
    expect(plugin.resolveId("@vanjs/setup", undefined, {ssr: true})).toEqual(toAbsolute('../setup/index-ssr.mjs'));
    expect(plugin.resolveId("@vanjs/setup", undefined, { ssr: false })).toEqual(toAbsolute('../setup/index-debug.mjs'));
    expect(plugin.resolveId("@vanjs/van", undefined, { ssr: true })).toEqual(toAbsolute('../setup/van-ssr.mjs'));
    expect(plugin.resolveId("@vanjs/van", undefined, { ssr: false })).toEqual(toAbsolute('../setup/van-debug.mjs'));
    expect(plugin.resolveId("@vanjs/vanX", undefined, { ssr: true } )).toEqual(toAbsolute('../setup/vanX-ssr.mjs'));
    expect(plugin.resolveId("@vanjs/vanX", undefined, { ssr: false })).toEqual(toAbsolute('../setup/vanX.mjs'));

    // resolve modules production
    process.env.NODE_ENV = 'production';
    // plugin.configResolved({ mode: "production", root: toAbsolute("..") } as any);
    expect(plugin.resolveId('@vanjs/setup', undefined, { ssr: true })).toEqual(toAbsolute('../setup/index-ssr.mjs'));
    expect(plugin.resolveId('@vanjs/setup', undefined, { ssr: false })).toEqual(toAbsolute('../setup/index.mjs'));
    expect(plugin.resolveId('@vanjs/van', undefined, { ssr: true })).toEqual(toAbsolute('../setup/van-ssr.mjs'));
    expect(plugin.resolveId('@vanjs/van', undefined, { ssr: false })).toEqual(toAbsolute('../setup/van.mjs'));
    expect(plugin.resolveId('@vanjs/vanX', undefined, { ssr: true })).toEqual(toAbsolute('../setup/vanX-ssr.mjs'));
    expect(plugin.resolveId('@vanjs/vanX', undefined, { ssr: false })).toEqual(toAbsolute('../setup/vanX.mjs'));

    // resolve modules test
    process.env.NODE_ENV = 'test';
    // plugin.configResolved({ mode: "test", root: toAbsolute("..") } as any);
    expect(plugin.resolveId('@vanjs/setup', undefined, { ssr: true })).toEqual(toAbsolute('../setup/index-ssr.mjs'));
    expect(plugin.resolveId('@vanjs/setup', undefined, { ssr: false })).toEqual(toAbsolute('../setup/index.mjs'));
    expect(plugin.resolveId('@vanjs/van', undefined, { ssr: true })).toEqual(toAbsolute('../setup/van-ssr.mjs'));
    expect(plugin.resolveId('@vanjs/van', undefined, { ssr: false })).toEqual(toAbsolute('../setup/van.mjs'));
    expect(plugin.resolveId('@vanjs/vanX', undefined, { ssr: true })).toEqual(toAbsolute('../setup/vanX-ssr.mjs'));
    expect(plugin.resolveId('@vanjs/vanX', undefined, { ssr: false })).toEqual(toAbsolute('../setup/vanX.mjs'));

    // edge cases
    expect(plugin.resolveId("vanjs-core", "/vite-plugin-vanjs/jsx/jsx.mjs", { ssr: false })).toEqual(toAbsolute('../setup/van.mjs'));
    expect(plugin.resolveId("src/van.js", "src/van-debug.js", { ssr: false })).toEqual(toAbsolute('../setup/van.mjs'));
    expect(plugin.resolveId("src/some-plugin-dont-exist", "another-importer", { ssr: true })).toEqual(null);

    // test plugin early returns
    const resolvedSetupSSR = plugin.resolveId('@vanjs/setup', undefined, { ssr: true });
    const resolvedSetup = plugin.resolveId('@vanjs/setup', undefined, { ssr: false });
    const resolvedVan = plugin.resolveId('@vanjs/van', undefined, { ssr: false });
    const resolvedVanSSR = plugin.resolveId('@vanjs/van', undefined, { ssr: true });
    const resolvedVanX = plugin.resolveId('@vanjs/vanX', undefined, { ssr: false });
    const resolvedVanXSSR = plugin.resolveId('@vanjs/vanX', undefined, { ssr: true });
    expect(plugin.resolveId(resolvedSetupSSR!, undefined, { ssr: true })).toEqual(toAbsolute('../setup/index-ssr.mjs'));
    expect(plugin.resolveId(resolvedSetup!, undefined, { ssr: false })).toEqual(toAbsolute('../setup/index.mjs'));
    expect(plugin.resolveId(resolvedVanSSR!, undefined, { ssr: true })).toEqual(toAbsolute('../setup/van-ssr.mjs'));
    expect(plugin.resolveId(resolvedVan!, undefined, { ssr: false })).toEqual(toAbsolute('../setup/van.mjs'));
    expect(plugin.resolveId(resolvedVanXSSR!, undefined, { ssr: true })).toEqual(toAbsolute('../setup/vanX-ssr.mjs'));
    expect(plugin.resolveId(resolvedVanX!, undefined, { ssr: false })).toEqual(toAbsolute('../setup/vanX.mjs'));

    expect(config).toEqual({
      optimizeDeps: {
        noDiscovery: true,
        include: [
          'vanjs-core',
          'vanjs-ext',
          'mini-van-plate/van-plate',
          'mini-van-plate/shares'
        ],
      },
      ssr: {
        noExternal: ['vanjs-*', '*-vanjs', '@vanjs/*'],
      },
      resolve: {
        alias: {
          '@vanjs/setup': expect.any(String),
          '@vanjs/van': expect.any(String),
          '@vanjs/vanX': expect.any(String),
          '@vanjs/client': expect.any(String),
          '@vanjs/server': expect.any(String),
          '@vanjs/meta': expect.any(String),
          '@vanjs/router': expect.any(String),
          '@vanjs/jsx': expect.any(String),
        },
      },
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: '@vanjs/jsx',
      },
    });
  });

  test("Test filesystem router", async () => {
    const plugin1 = vanjs({ routesDir: "tests/routes" });
    plugin1.configResolved({ mode: "development", root: toAbsolute("..") } as any);
    expect((await plugin1.load("\0virtual:@vanjs/routes", { ssr: true }))?.code.length).toBeGreaterThan(0);
    // console.log(routes);
    expect(routes.length).toEqual(7);
    routes.length = 0;
    const plugin2 = vanjs({ routesDir: "tests/not-exist" });
    plugin2.configResolved({ mode: "development", root: toAbsolute("..") } as any);
    expect((await plugin2.load("\0virtual:@vanjs/routes", { ssr: false }))).toEqual({ code: "", map: null});
    expect(routes.length).toEqual(0);
    const plugin3 = vanjs({ routesDir: "tests/routes/empty" });
    plugin3.configResolved({ mode: "development", root: toAbsolute("..") } as any);
    expect((await plugin2.load("\0virtual:@vanjs/routes", { ssr: false }))).toEqual({ code: "", map: null});
    const plugin4 = vanjs();
    expect((await plugin4.load("not-exist", { ssr: false }))).toBeNull();
  });

  test('Should set up file watchers correctly', () => {
    const plugin = vanjs();
  
    // Store handlers in an object
    const handlers: Record<string, (file: string) => void> = {};
    
    const mockServer = {
      watcher: {
        add: vi.fn(),
        on: vi.fn().mockImplementation((event: string, handler: (file: string) => void) => {
          // Store the handler when it's registered
          handlers[event] = handler;
        }),
      },
      moduleGraph: {
        getModuleById: vi.fn(() => ({
          // mock module if needed
        })),
        invalidateModule: vi.fn(),
      },
      ws: {
        send: vi.fn(),
      },
    };

    // Initialize plugin with config
    plugin.configResolved({ 
      root: '/mock/root',
      mode: 'development'
    } as any);

    // Set up server
    plugin.configureServer(mockServer as any);

    // Verify watcher was set up
    expect(mockServer.watcher.add).toHaveBeenCalledWith(join('/mock/root', 'src/routes'));
    expect(mockServer.watcher.on).toHaveBeenCalledWith('add', expect.any(Function));
    expect(mockServer.watcher.on).toHaveBeenCalledWith('change', expect.any(Function));
    expect(mockServer.watcher.on).toHaveBeenCalledWith('unlink', expect.any(Function));

    // Now we can trigger events using the stored handlers
    handlers.add('/mock/root/src/routes/new-page.tsx');

    // Verify the handler triggered appropriate actions
    expect(mockServer.moduleGraph.getModuleById).toHaveBeenCalled();
    expect(mockServer.ws.send).toHaveBeenCalledWith({ type: 'full-reload' });

    // Test other events
    handlers.change('/mock/root/src/routes/existing-page.tsx');
    handlers.unlink('/mock/root/src/routes/deleted-page.tsx');
  });

  test("Test router", async () => {
    // reset routes from file-system router
    routes.length = 0;
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
      component: lazy(() => import('./routes/(root)/index.ts'))
    });
  
    Route({
      path: '/test/:someParam',
      component: lazy(() => import('./routes/(root)/index.ts'))
    });

    // set router state
    setRouterState('/test');

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/test');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    await new Promise(res => setTimeout(res, 17));
    let html = await renderToString(Router());
    expect(html).to.contain('Hello VanJS!');

    // set router state
    setRouterState('/not-there');

    await new Promise(res => setTimeout(res, 17));
    expect(routerState.pathname.val).to.equal('/not-there');
    expect(routerState.searchParams.val.toString()).to.equal('');
    expect(routerState.params.val).to.deep.equal({});

    await new Promise(res => setTimeout(res, 17));
    html = await renderToString(Router());
    // console.log({ html })
    // expect(html).to.contain('Error loading page');
    expect(html).to.contain('Not found');

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
    expect(html).to.contain('Hello VanJS!');

    expect(fixRouteUrl('')).toEqual("/")
    expect(fixRouteUrl('test')).toEqual("/test")
  });
});
