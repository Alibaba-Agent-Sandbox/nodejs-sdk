import { Buffer } from "node:buffer";

import { ConnectionError, ServerAPIError } from "./errors.js";

/** Default in-sandbox HTTP port (`easy_sandbox.server`). */
export const DEFAULT_SERVER_PORT = 9000;

const SYNC_TIMEOUT_SLACK = 10;

export interface ServerClientOptions {
  /** Sent as `Authorization: Bearer` when set. */
  token?: string | null;
  /** Extra headers on every request. */
  headers?: Readonly<Record<string, string>>;
  /** Default per-request timeout in seconds. */
  timeout?: number;
}

export interface ShellOptions {
  cwd?: string;
  env?: Readonly<Record<string, string>>;
  /** Server-side command timeout in seconds. */
  timeout?: number;
}

/** Result of `POST /shell`. */
export interface ShellResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  truncated: boolean;
  readonly success: boolean;
}

/** Result of `POST /files/upload-stream`. `size` is the server's `bytes` field. */
export interface TransferResult {
  path: string;
  size: number;
}

interface RequestOptions {
  params?: Readonly<Record<string, string | number | boolean>>;
  jsonBody?: Readonly<Record<string, unknown>>;
  timeout?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorFromResponse(status: number, body: unknown, endpoint: string): ServerAPIError {
  const data = isRecord(body) ? body : {};
  const fromBody = data.error;
  const message =
    (typeof fromBody === "string" && fromBody) ||
    (typeof body === "string" && body) ||
    `Server returned HTTP ${status}`;
  const code = data.code;
  const endpointField = data.endpoint;
  return new ServerAPIError(message, {
    statusCode: status,
    errorType: typeof data.type === "string" ? data.type : "",
    errorCode: typeof code === "string" ? code : "",
    endpoint: typeof endpointField === "string" && endpointField ? endpointField : endpoint,
  });
}

/**
 * HTTP client for one in-sandbox `easy_sandbox.server` process.
 *
 * This slice talks to the same routes the local Python agent loop uses:
 * `GET /health`, `POST /shell`, `POST /files/upload-stream`, and
 * `GET /files/download-stream`. It does not create cloud sandboxes.
 */
export class ServerClient {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly files: ServerFilesApi;
  readonly process: ServerProcessApi;

  #token: string | undefined;
  #headers: Record<string, string>;
  #closed = false;
  #controllers = new Set<AbortController>();

  constructor(baseUrl: string, options: ServerClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.timeout = options.timeout ?? 30;
    this.#token = options.token ?? undefined;
    this.#headers = { ...(options.headers ?? {}) };
    this.files = new ServerFilesApi(this);
    this.process = new ServerProcessApi(this);
  }

  /** Headers sent on every request. */
  authHeaders(): Record<string, string> {
    const headers = { ...this.#headers };
    if (this.#token) headers.Authorization = `Bearer ${this.#token}`;
    return headers;
  }

  /** Abort in-flight requests. There is no connection pool in this slice. */
  async close(): Promise<void> {
    this.#closed = true;
    for (const controller of this.#controllers) controller.abort();
    this.#controllers.clear();
  }

  /**
   * `GET /health`. `true` when the server answers `{ "status": "ok" }`.
   * Connection failures and HTTP errors return `false`.
   */
  async health(): Promise<boolean> {
    try {
      const data = await this.send("health", "GET", "/health");
      return data.status === "ok";
    } catch (err) {
      if (err instanceof ConnectionError || err instanceof ServerAPIError) return false;
      throw err;
    }
  }

  async send(
    endpoint: string,
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<Record<string, unknown>> {
    if (this.#closed) {
      throw new ConnectionError(`ServerClient is closed (${this.baseUrl})`);
    }
    const url = new URL(path.replace(/^\//, ""), `${this.baseUrl}/`);
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url.searchParams.set(key, String(value));
      }
    }
    const headers = this.authHeaders();
    let body: string | undefined;
    if (options.jsonBody !== undefined) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = JSON.stringify(options.jsonBody);
    }
    const timeoutSeconds = options.timeout ?? this.timeout;
    const controller = new AbortController();
    this.#controllers.add(controller);
    const signal = AbortSignal.any([
      AbortSignal.timeout(Math.max(1, timeoutSeconds * 1000)),
      controller.signal,
    ]);
    let response: Response;
    try {
      response = await fetch(url, { method, headers, body, signal });
    } catch (err) {
      if (this.#closed || controller.signal.aborted) {
        throw new ConnectionError(`ServerClient is closed (${this.baseUrl})`);
      }
      const name = err instanceof Error ? err.name : "";
      if (name === "TimeoutError" || name === "AbortError") {
        throw new ConnectionError(
          `Timed out talking to the sandbox server at ${this.baseUrl}`,
        );
      }
      const detail = err instanceof Error ? err.message : String(err);
      throw new ConnectionError(
        `Could not reach the sandbox server at ${this.baseUrl}: ${detail}`,
      );
    } finally {
      this.#controllers.delete(controller);
    }

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }
    if (response.status >= 400) {
      throw errorFromResponse(response.status, parsed, endpoint);
    }
    if (!isRecord(parsed)) {
      throw new ServerAPIError(
        `Sandbox server returned a non-JSON object (HTTP ${response.status})`,
        { statusCode: response.status, errorType: "ProtocolError", endpoint },
      );
    }
    return parsed;
  }
}

export class ServerFilesApi {
  constructor(private readonly client: ServerClient) {}

  /** `POST /files/upload-stream` with `{ path, content_base64 }`. */
  async upload(path: string, data: string | Uint8Array): Promise<TransferResult> {
    const payload = typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data);
    const out = await this.client.send("files_upload_stream", "POST", "/files/upload-stream", {
      jsonBody: {
        path,
        content_base64: payload.toString("base64"),
      },
    });
    const written = out.path;
    const size = out.bytes;
    return {
      path: typeof written === "string" ? written : path,
      size: typeof size === "number" ? size : payload.length,
    };
  }

  /** `GET /files/download-stream?path=`. */
  async download(path: string): Promise<Uint8Array> {
    const data = await this.client.send(
      "files_download_stream",
      "GET",
      "/files/download-stream",
      { params: { path } },
    );
    const encoded = data.content_base64;
    if (typeof encoded !== "string") {
      throw new ServerAPIError("Server returned an invalid download body", {
        errorType: "ProtocolError",
        endpoint: "files_download_stream",
        statusCode: 200,
      });
    }
    return new Uint8Array(Buffer.from(encoded, "base64"));
  }

  async readText(path: string, encoding = "utf-8"): Promise<string> {
    const bytes = await this.download(path);
    return new TextDecoder(encoding).decode(bytes);
  }
}

export class ServerProcessApi {
  constructor(private readonly client: ServerClient) {}

  /**
   * `POST /shell` with JSON `{ command }`.
   * `cwd`, `env`, and `timeout` are sent only when set, matching the Python client.
   * The command is tokenised by the server; it is not passed to a shell.
   */
  async shell(command: string, options: ShellOptions = {}): Promise<ShellResult> {
    const jsonBody: Record<string, unknown> = { command };
    if (options.cwd !== undefined) jsonBody.cwd = options.cwd;
    if (options.env && Object.keys(options.env).length > 0) jsonBody.env = { ...options.env };
    if (options.timeout !== undefined) jsonBody.timeout = options.timeout;
    const httpTimeout = (options.timeout ?? 300) + SYNC_TIMEOUT_SLACK;
    const data = await this.client.send("shell", "POST", "/shell", {
      jsonBody,
      timeout: httpTimeout,
    });
    const exitCode = data.exit_code;
    const result: ShellResult = {
      stdout: typeof data.stdout === "string" ? data.stdout : "",
      stderr: typeof data.stderr === "string" ? data.stderr : "",
      exitCode: typeof exitCode === "number" ? exitCode : 0,
      truncated: data.truncated === true,
      get success() {
        return this.exitCode === 0;
      },
    };
    return result;
  }
}
