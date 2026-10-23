import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { ConnectionError, ServerAPIError, ServerClient } from "../dist/index.js";

function listen(handler) {
  const server = createServer(handler);
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address && typeof address === "object" ? address.port : 0;
      resolve({
        port,
        close: () =>
          new Promise((done, fail) => {
            server.close((err) => (err ? fail(err) : done()));
          }),
      });
    });
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

test("health, shell, upload-stream, and download-stream match the server JSON", async () => {
  const hits = [];
  const server = await listen(async (req, res) => {
    const body = await readBody(req);
    hits.push({ method: req.method, url: req.url, body, authorization: req.headers.authorization });
    res.setHeader("content-type", "application/json");
    if (req.url === "/health") {
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (req.url === "/shell") {
      res.end(JSON.stringify({ stdout: "4\n", stderr: "", exit_code: 0 }));
      return;
    }
    if (req.url === "/files/upload-stream") {
      const parsed = JSON.parse(body);
      const size = Buffer.from(parsed.content_base64, "base64").length;
      res.end(JSON.stringify({ path: parsed.path, bytes: size }));
      return;
    }
    if (req.url?.startsWith("/files/download-stream")) {
      const url = new URL(req.url, "http://127.0.0.1");
      const data = Buffer.from("answer=4\n", "utf8");
      res.end(
        JSON.stringify({
          path: url.searchParams.get("path"),
          content_base64: data.toString("base64"),
          bytes: data.length,
        }),
      );
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "unexpected", type: "ValueError" }));
  });

  const client = new ServerClient(`http://127.0.0.1:${server.port}`, {
    timeout: 5,
    token: "server-token",
  });
  try {
    assert.equal(await client.health(), true);
    const ran = await client.process.shell("python3 -c 'print(2 + 2)'");
    assert.equal(ran.stdout, "4\n");
    assert.equal(ran.stderr, "");
    assert.equal(ran.exitCode, 0);
    assert.equal(ran.success, true);
    const uploaded = await client.files.upload("/tmp/result.txt", "answer=4\n");
    assert.equal(uploaded.path, "/tmp/result.txt");
    assert.equal(uploaded.size, 9);
    assert.equal(await client.files.readText("/tmp/result.txt"), "answer=4\n");
  } finally {
    await client.close();
    await server.close();
  }

  assert.deepEqual(
    hits.map((hit) => hit.method + " " + hit.url.split("?")[0]),
    [
      "GET /health",
      "POST /shell",
      "POST /files/upload-stream",
      "GET /files/download-stream",
    ],
  );
  assert.equal(JSON.parse(hits[1].body).command, "python3 -c 'print(2 + 2)'");
  assert.deepEqual(Object.keys(JSON.parse(hits[1].body)), ["command"]);
  const upload = JSON.parse(hits[2].body);
  assert.deepEqual(Object.keys(upload), ["path", "content_base64"]);
  assert.equal(Buffer.from(upload.content_base64, "base64").toString("utf8"), "answer=4\n");
  const download = new URL(hits[3].url, "http://127.0.0.1");
  assert.equal(download.searchParams.get("path"), "/tmp/result.txt");
  assert.equal(hits[1].authorization, "Bearer server-token");
});

test("optional shell fields are omitted unless set", async () => {
  let body = "";
  const server = await listen(async (req, res) => {
    body = await readBody(req);
    res.end(JSON.stringify({ stdout: "", stderr: "", exit_code: 0 }));
  });
  const client = new ServerClient(`http://127.0.0.1:${server.port}`, { timeout: 5 });
  try {
    await client.process.shell("true", { cwd: "/tmp", env: { A: "1" }, timeout: 3 });
  } finally {
    await client.close();
    await server.close();
  }
  assert.deepEqual(JSON.parse(body), {
    command: "true",
    cwd: "/tmp",
    env: { A: "1" },
    timeout: 3,
  });
});

test("HTTP errors raise ServerAPIError and a closed port is unhealthy", async () => {
  const server = await listen(async (req, res) => {
    await readBody(req);
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Missing or invalid 'command'", type: "ValueError" }));
  });
  const client = new ServerClient(`http://127.0.0.1:${server.port}`, { timeout: 2 });
  try {
    await assert.rejects(client.process.shell(""), ServerAPIError);
  } finally {
    await client.close();
    await server.close();
  }

  const closed = new ServerClient(`http://127.0.0.1:${server.port}`, { timeout: 1 });
  assert.equal(await closed.health(), false);
  await closed.close();
  await assert.rejects(() => closed.process.shell("true"), ConnectionError);
});

test("bound proxy prefix and signed query bytes survive operation joins", async () => {
  const hits = [];
  const server = await listen(async (req, res) => {
    hits.push({ url: req.url, app: req.headers.authorization, gateway: req.headers['x-gateway-token'] });
    res.end(JSON.stringify({ status: 'ok', content_base64: '' }));
  });
  const client = new ServerClient(`http://127.0.0.1:${server.port}/proxy/sandbox-123/9000/?sig=a%2Fb%20c`, {
    token: 'application-token', gatewayHeaders: { 'X-Gateway-Token': 'gateway-token' },
  });
  try {
    assert.equal(await client.health(), true);
    await client.files.download('/tmp/a b');
    assert.equal(hits[0].url, '/proxy/sandbox-123/9000/health?sig=a%2Fb%20c');
    assert.equal(hits[1].url, '/proxy/sandbox-123/9000/files/download-stream?sig=a%2Fb%20c&path=%2Ftmp%2Fa+b');
    assert.equal(hits[0].app, 'Bearer application-token');
    assert.equal(hits[0].gateway, 'gateway-token');
    assert.ok(!client.baseUrl.includes('sig='));
    await assert.rejects(client.send('x', 'GET', '/health', { params: { sig: 'replacement' } }), TypeError);
  } finally { await client.close(); await server.close(); }
});

test("userinfo, authority overrides and overlapping credentials are rejected before a request", () => {
  for (const url of ['http://user:secret@localhost:9000', 'file:///tmp/server', 'http://localhost:9000/#fragment']) {
    assert.throws(() => new ServerClient(url), TypeError);
  }
  for (const name of ['Host', ':authority', 'Forwarded', 'X-Forwarded-Host', 'X-Forwarded-Proto', 'X-Forwarded-Port', 'Proxy-Authorization', 'Content-Length']) {
    assert.throws(() => new ServerClient('http://localhost:9000', { headers: { [name]: 'bad' } }), TypeError);
  }
  assert.throws(() => new ServerClient('http://localhost:9000', { token: 'app', gatewayHeaders: { authorization: 'gateway' } }), TypeError);
  assert.throws(() => new ServerClient('http://localhost:9000', { headers: { 'X-Token': 'app' }, gatewayHeaders: { 'x-token': 'gateway' } }), TypeError);
});

test("redirects cannot move even same-origin credentials to a different sandbox", async () => {
  const hits = [];
  const server = await listen(async (req, res) => {
    hits.push(req.url);
    res.statusCode = 307;
    res.setHeader('location', '/proxy/another-sandbox/9000/health?stolen=1');
    res.end();
  });
  const client = new ServerClient(`http://127.0.0.1:${server.port}/proxy/owned/9000?sig=secret`, { token: 'app' });
  try {
    await assert.rejects(client.send('health', 'GET', '/health'), error => error instanceof ServerAPIError && error.statusCode === 307 && !String(error).includes('secret'));
    assert.equal(hits.length, 1);
    for (const path of ['//foreign.test/x', '/../other', '/%2e%2e/other', '/health?query', '/a%2fb', '/a\\b']) {
      await assert.rejects(client.send('x', 'GET', path), TypeError);
    }
    assert.equal(hits.length, 1);
  } finally { await client.close(); await server.close(); }
});

test("connection errors and object inspection do not disclose signed URL queries", async () => {
  const { inspect } = await import('node:util');
  const client = new ServerClient('http://127.0.0.1:1/proxy/owned?token=signed-secret');
  assert.ok(!inspect(client).includes('signed-secret'));
  await assert.rejects(client.send('health', 'GET', '/health'), error => error instanceof ConnectionError && !String(error).includes('signed-secret'));
  await client.close();
});
