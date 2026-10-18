#!/usr/bin/env node
/**
 * Local stand-in for: create sandbox -> exec -> read result -> kill.
 *
 * Starts `python3 -m agent_sandbox.server serve` on 127.0.0.1, talks to it with
 * ServerClient, and prints every response. Same four steps as
 * python-sdk/examples/scenarios/agent_loop_local.py. Does not call a cloud API.
 */
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ServerClient } from "../dist/index.js";

const DROPPED_ENV = [
  "ABX_SERVER_TOKEN",
  "ABX_SERVER_POLICY",
  "ABX_SERVER_POLICY_FILE",
  "ABX_SERVER_ENABLED_GROUPS",
  "ABX_SANDBOX_API_KEY",
  // Never hand a GitHub credential to the local server process.
  "GH_TOKEN",
  "GITHUB_TOKEN",
];

function pythonRepr(value) {
  const escaped = String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t");
  return `'${escaped}'`;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address && typeof address === "object" ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const SIGNAL_NUMBERS = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGQUIT: 3,
  SIGKILL: 9,
  SIGTERM: 15,
};

function statusOf(code, signal) {
  if (code !== null && code !== undefined) return code;
  if (signal && Object.hasOwn(SIGNAL_NUMBERS, signal)) return -SIGNAL_NUMBERS[signal];
  return signal ?? null;
}

function waitExit(proc, ms) {
  if (proc.exitCode !== null || proc.signalCode !== null) {
    return Promise.resolve(statusOf(proc.exitCode, proc.signalCode));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("timeout waiting for server to exit"));
    }, ms);
    proc.once("exit", (code, signal) => {
      clearTimeout(timer);
      resolve(statusOf(code, signal));
    });
  });
}

function stop(proc, signal) {
  if (proc.pid === undefined) return;
  try {
    process.kill(-proc.pid, signal);
  } catch (err) {
    if (err && err.code === "ESRCH") return;
    try {
      proc.kill(signal);
    } catch {
      // already gone
    }
  }
}

function childEnv(baseDir) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") env[key] = value;
  }
  for (const name of DROPPED_ENV) delete env[name];
  env.ABX_SERVER_BASE_DIR = baseDir;
  return env;
}

async function main() {
  const work = "/tmp/abx-agent-loop-node";
  const base = path.join(work, "base");
  await mkdir(base, { recursive: true });
  const port = await freePort();
  const proc = spawn(
    "python3",
    ["-m", "agent_sandbox.server", "serve", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: work,
      env: childEnv(base),
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let log = "";
  const append = (chunk) => {
    if (log.length < 64_000) log += chunk.toString("utf8");
  };
  proc.stdout?.on("data", append);
  proc.stderr?.on("data", append);

  const client = new ServerClient(`http://127.0.0.1:${port}`, { timeout: 10 });
  try {
    let healthy = false;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      try {
        if (await client.health()) {
          healthy = true;
          break;
        }
      } catch {
        // health() already maps connection errors to false
      }
      if (proc.exitCode !== null || proc.signalCode !== null) {
        console.log(log);
        return 1;
      }
      await sleep(100);
    }
    if (!healthy) {
      console.log(log);
      console.log("server did not become healthy");
      return 1;
    }

    console.log("step 1  create");
    console.log(`  server  http://127.0.0.1:${port}`);
    console.log(`  health  ${await client.health()}`);

    console.log("step 2  exec");
    const ran = await client.process.shell("python3 -c 'print(2 + 2)'");
    console.log(`  exit    ${ran.exitCode}`);
    console.log(`  stdout  ${pythonRepr(ran.stdout)}`);
    console.log(`  stderr  ${pythonRepr(ran.stderr)}`);

    console.log("step 3  read result");
    const target = path.join(base, "result.txt");
    const uploaded = await client.files.upload(target, "answer=4\n");
    const text = await client.files.readText(target);
    console.log(`  wrote   ${uploaded.path} (${uploaded.size} bytes)`);
    console.log(`  read    ${pythonRepr(text)}`);

    console.log("step 4  kill");
    stop(proc, "SIGTERM");
    const code = await waitExit(proc, 5000);
    console.log("  signal  SIGTERM");
    console.log(`  return  ${code}`);
    return ran.exitCode === 0 && text === "answer=4\n" ? 0 : 1;
  } finally {
    await client.close();
    if (proc.exitCode === null && proc.signalCode === null) {
      stop(proc, "SIGKILL");
      try {
        await waitExit(proc, 5000);
      } catch {
        // already reaped
      }
    }
  }
}

const here = path.dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && path.resolve(process.argv[1]) === path.join(here, "agent-loop.mjs")) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
