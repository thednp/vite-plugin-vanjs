// @vitest-environment node
import { expect, test, describe, beforeEach } from "vitest";
import { dataCache } from "@vanjs/router";

const entry = (data: unknown, timestamp = 1) => ({ data, timestamp });

describe(`Test dataCache`, () => {
  beforeEach(() => {
    dataCache.clear();
    dataCache.setMaxRoutes(20);
  });

  test(`Test set, get, has and size`, () => {
    expect(dataCache.size()).to.equal(0);
    expect(dataCache.get("/missing", "key")).toBeUndefined();
    expect(dataCache.has("/missing")).to.equal(false);
    expect(dataCache.has("/missing", "key")).to.equal(false);

    dataCache.set("/route", "key", entry("first"));
    dataCache.set("/route", "other", { data: "second" });

    expect(dataCache.size()).to.equal(1);
    expect(dataCache.get("/route", "key")?.data).to.equal("first");
    expect(dataCache.get("/route", "key")?.timestamp).to.equal(1);
    expect(dataCache.get("/route", "other")?.timestamp).to.be.a("number");
    expect(dataCache.get("/route", "missing")).toBeUndefined();

    expect(dataCache.has("/route")).to.equal(true);
    expect(dataCache.has("/route", "key")).to.equal(true);
    expect(dataCache.has("/route", "missing")).to.equal(false);
    expect(dataCache.has("/route", undefined)).to.equal(true);
  });

  test(`Test path normalization`, () => {
    dataCache.set("/about/", "key", entry("trailing"));
    expect(dataCache.get("/about", "key")?.data).to.equal("trailing");
    expect(dataCache.get("/about/", "key")?.data).to.equal("trailing");

    dataCache.set("", "key", entry("root"));
    expect(dataCache.get("/", "key")?.data).to.equal("root");
    expect(dataCache.get("", "key")?.data).to.equal("root");
    expect(dataCache.getRoute("/")?.key.data).to.equal("root");
  });

  test(`Test getRoute and toJSON`, () => {
    expect(dataCache.getRoute("/missing")).toBeUndefined();

    dataCache.set("/route", "key", entry("value", 7));
    dataCache.set("/route", "failed", {
      data: null,
      error: new Error("server error"),
    });

    const route = dataCache.getRoute("/route");
    expect(Object.keys(route || {})).to.deep.equal(["key", "failed"]);
    expect(route?.key.data).to.equal("value");

    const json = dataCache.toJSON();
    expect(Object.keys(json)).to.deep.equal(["/route"]);
    expect(json["/route"].key.timestamp).to.equal(7);
    expect(json["/route"].key.error).to.equal(null);
    expect(json["/route"].failed.error?.message).to.equal("server error");
  });

  test(`Test del`, () => {
    expect(dataCache.del("/missing")).to.equal(false);
    expect(dataCache.del("/missing", "key")).to.equal(false);

    dataCache.set("/route", "first", entry(1));
    dataCache.set("/route", "second", entry(2));

    expect(dataCache.del("/route", "missing")).to.equal(false);
    expect(dataCache.del("/route", "first")).to.equal(true);
    expect(dataCache.has("/route")).to.equal(true);
    expect(dataCache.has("/route", "first")).to.equal(false);

    // deleting the last entry also deletes the route
    expect(dataCache.del("/route", "second")).to.equal(true);
    expect(dataCache.has("/route")).to.equal(false);
    expect(dataCache.size()).to.equal(0);

    dataCache.set("/other", "key", entry(1));
    expect(dataCache.del("/other")).to.equal(true);
    expect(dataCache.del("/other")).to.equal(false);
  });

  test(`Test touch`, () => {
    dataCache.touch("/missing");

    dataCache.set("/first", "key", entry(1));
    dataCache.set("/second", "key", entry(2));
    expect(Object.keys(dataCache.toJSON())).to.deep.equal(["/first", "/second"]);

    dataCache.touch("/first");
    expect(Object.keys(dataCache.toJSON())).to.deep.equal(["/second", "/first"]);
  });

  test(`Test hydrateFromJSON`, () => {
    dataCache.hydrateFromJSON(null as any);
    dataCache.hydrateFromJSON("not-an-object" as any);
    expect(dataCache.size()).to.equal(0);

    dataCache.hydrateFromJSON({
      "/hydrated/": {
        "": { data: "from-ssr", error: null, timestamp: 11 },
        "failed": { data: null, error: { message: "server error" }, timestamp: 12 },
      },
    } as any);

    expect(dataCache.get("/hydrated", "")?.data).to.equal("from-ssr");
    expect(dataCache.get("/hydrated", "")?.timestamp).to.equal(11);
    expect(dataCache.get("/hydrated", "failed")?.error?.message).to.equal(
      "server error",
    );
    expect(dataCache.get("/hydrated", "failed")?.timestamp).to.equal(12);

    // hydrating again into an existing route, without timestamps
    dataCache.hydrateFromJSON({
      "/hydrated": { cached: { data: true, error: null } },
    } as any);

    expect(dataCache.get("/hydrated", "cached")?.data).to.equal(true);
    expect(dataCache.get("/hydrated", "cached")?.timestamp).to.be.a("number");
    expect(dataCache.get("/hydrated", "")?.data).to.equal("from-ssr");
  });

  test(`Test setMaxRoutes and eviction`, () => {
    // a limit of zero or lower disables the eviction
    dataCache.setMaxRoutes(0);
    dataCache.set("/1", "key", entry(1));
    dataCache.set("/2", "key", entry(2));
    dataCache.set("/3", "key", entry(3));
    expect(dataCache.size()).to.equal(3);

    dataCache.clear();
    dataCache.setMaxRoutes(1);
    dataCache.set("/1", "key", entry(1));
    dataCache.set("/2", "key", entry(2));
    expect(dataCache.size()).to.equal(1);
    expect(dataCache.has("/1")).to.equal(false);
    expect(dataCache.has("/2")).to.equal(true);

    dataCache.set("/3", "key", entry(3));
    expect(dataCache.size()).to.equal(1);
    expect(dataCache.has("/3")).to.equal(true);
  });
});
