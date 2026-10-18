import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
