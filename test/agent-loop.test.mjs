import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";

import { ServerAPIError, ServerClient } from "../dist/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("named application commands work with the actual Python runtime", { timeout: 60_000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "node-sdk-commands-"));
  const reservation = createServer();
  await new Promise((resolve, reject) => {
    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", resolve);
  });
  const port = reservation.address().port;
  await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()));
  const commands = path.join(directory, "commands.py");
  await writeFile(commands, `from agent_sandbox.server import command

@command("inspect_inputs")
def inspect_inputs(timeout: int, name: str, arguments: str, server_port: int,
                   requestTimeout: int, labels: list[str], enabled: bool) -> dict:
    return {"timeout": timeout, "name": name, "arguments": arguments,
            "server_port": server_port, "requestTimeout": requestTimeout,
            "labels": labels, "enabled": enabled}
`);
  const child = spawn("python3", ["-m", "agent_sandbox.server", "serve", "--host", "127.0.0.1",
    "--port", String(port), "--commands", commands], {
    env: { ...process.env, ABX_SERVER_TOKEN: "fixture-command-token", ABX_SERVER_BASE_DIR: directory },
    stdio: ["ignore", "ignore", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", chunk => { stderr += chunk; });
  const exited = new Promise(resolve => child.once("exit", resolve));
  const client = new ServerClient(`http://127.0.0.1:${port}`, { token: "fixture-command-token", timeout: 1 });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (await client.health()) { ready = true; break; }
      if (child.exitCode !== null) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, "Python runtime did not start: " + stderr);
    const listed = await client.commands.list();
    assert.ok(listed.some(command => command.name === "inspect_inputs" && command.args.some(arg => arg.name === "timeout")));
    const payload = { timeout: 5, name: "business", arguments: "preserved", server_port: 42,
      requestTimeout: 7, labels: ["one", "two"], enabled: false };
    assert.deepEqual(await client.commands.invoke("inspect_inputs", payload, { requestTimeout: 5 }), payload);
    await assert.rejects(client.commands.invoke("inspect_inputs", {}), error => error instanceof ServerAPIError && error.statusCode === 400);
    await assert.rejects(client.commands.invoke("missing_command", {}), error => error instanceof ServerAPIError && error.statusCode === 404);
  } finally {
    await client.close();
    if (child.exitCode === null) child.kill("SIGTERM");
    await exited;
    await rm(directory, { recursive: true, force: true });
  }
});

function fromPythonRepr(literal) {
  assert.equal(literal.startsWith("'"), true, literal);
  assert.equal(literal.endsWith("'"), true, literal);
  const body = literal.slice(1, -1);
  let out = "";
  for (let i = 0; i < body.length; i += 1) {
    if (body[i] !== "\\") {
      out += body[i];
      continue;
    }
    const next = body[(i += 1)];
    if (next === "n") out += "\n";
    else if (next === "r") out += "\r";
    else if (next === "t") out += "\t";
    else if (next === "\\") out += "\\";
    else if (next === "'") out += "'";
    else throw new Error(`bad escape \\${next} in ${literal}`);
  }
  return out;
}

function runExample(extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "examples/agent-loop.mjs")], {
      cwd: root,
      env: { ...process.env, ...extraEnv },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

test("agent loop preserves caller Python source configuration", { timeout: 60_000, skip: process.platform === "win32" }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "node-sdk-pythonpath-"));
  const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
  try {
    const bin = path.join(directory, "bin");
    const source = path.join(directory, "explicit-source");
    await mkdir(bin);
    await mkdir(source);
    const record = path.join(directory, "pythonpath.txt");
    const python = execFileSync("python3", ["-c", "import sys;print(sys.executable)"], { encoding: "utf8" }).trim();
    await writeFile(path.join(bin, "python3"), `#!/bin/sh\nprintf '%s' "$PYTHONPATH" > ${quote(record)}\nexec ${quote(python)} "$@"\n`, { mode: 0o755 });
    const expected = [source, process.env.PYTHONPATH ?? ""].filter(Boolean).join(path.delimiter);
    const result = await runExample({ PATH: bin + path.delimiter + process.env.PATH, PYTHONPATH: expected });
    assert.equal(result.code, 0, result.stdout + result.stderr);
    assert.equal(await readFile(record, "utf8"), expected);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("agent loop stdout contains 4\\n and the read text is answer=4\\n", { timeout: 60_000 }, async () => {
  const { code, stdout, stderr } = await runExample();
  assert.equal(code, 0, stdout + stderr);
  const stdoutField = stdout.match(/^\s*stdout\s+(\S+)\s*$/m);
  const readField = stdout.match(/^\s*read\s+(\S+)\s*$/m);
  assert.ok(stdoutField, stdout);
  assert.ok(readField, stdout);
  const shellStdout = fromPythonRepr(stdoutField[1]);
  const readText = fromPythonRepr(readField[1]);
  assert.ok(shellStdout.includes("4\n"), JSON.stringify(shellStdout));
  assert.equal(readText, "answer=4\n");
  assert.match(stdout, /step 1  create/);
  assert.match(stdout, /step 2  exec/);
  assert.match(stdout, /step 3  read result/);
  assert.match(stdout, /step 4  kill/);
  assert.match(stdout, /signal  SIGTERM/);
});
