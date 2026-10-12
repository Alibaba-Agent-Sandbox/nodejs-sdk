/** Failure reported by the in-sandbox HTTP server (HTTP status >= 400, or a non-object body). */
export class ServerAPIError extends Error {
  readonly statusCode: number;
  readonly errorType: string;
  readonly errorCode: string;
  readonly endpoint: string;

  constructor(
    message: string,
    info: {
      statusCode: number;
      errorType?: string;
      errorCode?: string;
      endpoint?: string;
    },
  ) {
    super(message);
    this.name = "ServerAPIError";
    this.statusCode = info.statusCode;
    this.errorType = info.errorType ?? "";
    this.errorCode = info.errorCode ?? "";
    this.endpoint = info.endpoint ?? "";
  }
}

/** The server could not be reached, or this client is already closed. */
export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectionError";
  }
}
