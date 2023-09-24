export class HttpError {
  readonly _tag = "HttpError";
  constructor(readonly cause: unknown) {}
}
