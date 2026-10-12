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
