import * as fs from "node:fs";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  createStaticServer,
  etagOf,
  resolvePath,
} from "../lib/static-server.ts";

let root: string;

beforeAll(async () => {
  const tmp = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "static-server-"),
  );
  root = path.join(tmp, "public");
  await fs.promises.mkdir(path.join(root, "prefabs"), { recursive: true });
  await fs.promises.mkdir(path.join(root, "empty"));
  await fs.promises.mkdir(path.join(root, "evil.example"));
  await fs.promises.writeFile(path.join(root, "index.html"), "<p>top</p>");
  await fs.promises.writeFile(
    path.join(root, "prefabs", "index.html"),
    "<p>prefabs</p>",
  );
  await fs.promises.writeFile(path.join(root, "main.js"), "console.log(1);");
  await fs.promises.writeFile(path.join(tmp, "secret.txt"), "secret");
});

afterAll(async () => {
  await fs.promises.rm(path.dirname(root), { recursive: true, force: true });
});

describe("resolvePath", () => {
  it("resolves a plain file", async () => {
    const r = await resolvePath(root, "/main.js?v=1");
    expect(r).toMatchObject({ status: 200, file: path.join(root, "main.js") });
  });

  it.each(["/../secret.txt", "/%2e%2e/secret.txt"])(
    "returns 404 for dot segments the URL parser collapses: %s",
    async (url) => {
      expect(await resolvePath(root, url)).toEqual({ status: 404 });
    },
  );

  it("returns 403 for an encoded-backslash traversal", async () => {
    expect(await resolvePath(root, "/..%5c..%5csecret.txt")).toEqual({
      status: 403,
    });
  });

  it("returns 403 for an encoded-slash traversal", async () => {
    expect(await resolvePath(root, "/prefabs/..%2f..%2fsecret.txt")).toEqual({
      status: 403,
    });
  });

  it.each(["/%E0%A4%A", "/%zz", "/%"])(
    "returns 400 for malformed percent-encoding: %s",
    async (url) => {
      expect(await resolvePath(root, url)).toEqual({ status: 400 });
    },
  );

  it("returns 400 for a non-origin-form target", async () => {
    expect(await resolvePath(root, "http://example.com/")).toEqual({
      status: 400,
    });
  });

  it("serves index.html for a directory URL with a trailing slash", async () => {
    expect(await resolvePath(root, "/")).toMatchObject({
      status: 200,
      file: path.join(root, "index.html"),
    });
    expect(await resolvePath(root, "/prefabs/")).toMatchObject({
      status: 200,
      file: path.join(root, "prefabs", "index.html"),
    });
  });

  it("returns 404 for a directory without index.html", async () => {
    expect(await resolvePath(root, "/empty/")).toEqual({ status: 404 });
  });

  it("returns 404 for a missing file", async () => {
    expect(await resolvePath(root, "/nope.js")).toEqual({ status: 404 });
  });

  it("redirects a directory URL without a trailing slash", async () => {
    expect(await resolvePath(root, "/prefabs")).toEqual({
      status: 302,
      location: "./prefabs/",
    });
  });

  it("keeps the query string on the trailing-slash redirect", async () => {
    expect(await resolvePath(root, "/prefabs?q=1")).toEqual({
      status: 302,
      location: "./prefabs/?q=1",
    });
  });

  it("redirects when only an encoded slash ends the path", async () => {
    expect(await resolvePath(root, "/prefabs%2f")).toEqual({
      status: 302,
      location: "./prefabs%2f/",
    });
  });

  it("keeps the redirect on the same origin for a protocol-relative-looking path", async () => {
    expect(await resolvePath(root, "//evil.example")).toEqual({
      status: 302,
      location: "./evil.example/",
    });
  });
});

describe("createStaticServer", () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    server = createStaticServer(root);
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function request(
    urlPath: string,
    options: http.RequestOptions = {},
  ): Promise<{
    status: number;
    headers: http.IncomingHttpHeaders;
    body: string;
  }> {
    return new Promise((resolve, reject) => {
      const req = http.request(
        { host: "127.0.0.1", port, path: urlPath, ...options },
        (res) => {
          let body = "";
          res.setEncoding("utf8");
          res.on("data", (chunk: string) => (body += chunk));
          res.on("end", () =>
            resolve({
              status: res.statusCode ?? 0,
              headers: res.headers,
              body,
            }),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
  }

  it("serves a file with content type, length and ETag", async () => {
    const res = await request("/main.js");
    expect(res.status).toBe(200);
    expect(res.body).toBe("console.log(1);");
    expect(res.headers["content-type"]).toBe("text/javascript; charset=utf-8");
    expect(res.headers["content-length"]).toBe("15");
    const stat = await fs.promises.stat(path.join(root, "main.js"));
    expect(res.headers.etag).toBe(etagOf(stat));
  });

  it("serves the directory index", async () => {
    const res = await request("/prefabs/");
    expect(res.status).toBe(200);
    expect(res.body).toBe("<p>prefabs</p>");
  });

  it("redirects a directory URL without a trailing slash", async () => {
    const res = await request("/prefabs");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("./prefabs/");
  });

  it("does not serve files outside the root", async () => {
    const res = await request("/prefabs/..%2f..%2fsecret.txt");
    expect(res.status).toBe(403);
    expect(res.body).toBe("");
  });

  it("returns 400 for malformed percent-encoding", async () => {
    expect((await request("/%zz")).status).toBe(400);
  });

  it("returns 304 when If-None-Match matches", async () => {
    const { headers } = await request("/main.js");
    const res = await request("/main.js", {
      headers: { "if-none-match": `"other", ${headers.etag}` },
    });
    expect(res.status).toBe(304);
    expect(res.body).toBe("");
  });

  it("answers HEAD without a body", async () => {
    const res = await request("/main.js", { method: "HEAD" });
    expect(res.status).toBe(200);
    expect(res.headers["content-length"]).toBe("15");
    expect(res.body).toBe("");
  });

  it("returns 405 for other methods", async () => {
    const res = await request("/main.js", { method: "POST" });
    expect(res.status).toBe(405);
    expect(res.headers.allow).toBe("GET, HEAD");
  });

  it("returns 500 when a file passes stat but cannot be opened", async () => {
    const target = path.join(root, "main.js");
    const open = fs.promises.open;
    vi.spyOn(fs.promises, "open").mockImplementation((file, ...rest) =>
      file === target
        ? Promise.reject(Object.assign(new Error("EACCES"), { code: "EACCES" }))
        : open(file, ...rest),
    );
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await request("/main.js");
    expect(res.status).toBe(500);
    expect(error).toHaveBeenCalledWith(
      `static-server: cannot open ${target}:`,
      expect.any(Error),
    );
  });
});
