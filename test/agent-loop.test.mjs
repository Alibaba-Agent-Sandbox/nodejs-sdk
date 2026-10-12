import assert from "node:assert/strict";
import { spawn } from "node:child_process";
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

function runExample() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "examples/agent-loop.mjs")], {
      cwd: root,
      env: process.env,
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
