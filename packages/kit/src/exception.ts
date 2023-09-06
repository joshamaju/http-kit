export class HttpError {
  readonly _tag = "HttpError";
  constructor(readonly message: string, readonly originalError?: unknown) {}
}
