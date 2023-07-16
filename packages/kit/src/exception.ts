export abstract class Err {
  abstract readonly _tag: string;
  constructor(readonly message: string) {}
}

export class ApplicationError extends Err {
  readonly _tag = "ApplicationError";
  constructor(readonly message: string, readonly originalError?: unknown) {
    super(message);
  }
}

export class HttpError extends Err {
  readonly _tag = "HttpError";
}
