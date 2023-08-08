// export abstract class Err {
//   abstract readonly _tag: string;
//   constructor(readonly message: string) {}
// }

export class HttpError {
  readonly _tag = "HttpError";
  constructor(readonly message: string, readonly originalError?: unknown) {
    // super(message);
  }
}
