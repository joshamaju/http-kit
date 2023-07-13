import * as Effect from "@effect/io/Effect";
import { Interceptor } from "../execute/types.js";
import { pipe, flow } from "@effect/data/Function";
import { Executor, Interpreter } from "../interpreter.js";
import { execute as executor } from "../execute/mod.js";
import { Err, RequestEffectT } from "../types.js";

export class ApplicationError extends Err {
  readonly _tag = "ApplicationError";
  constructor(readonly message: string, readonly originalError?: unknown) {
    super(message);
  }
}

export class HttpError extends Err {
  readonly _tag = "HttpError";
}

const fetch_: Executor = (input, init) => {
  return Effect.tryCatchPromiseInterrupt(
    (signal) => fetch(input, { ...init, signal }),
    (error) =>
      error instanceof Error
        ? error.name === "NetworkError"
          ? new HttpError("Network error")
          : new ApplicationError(error.message)
        : new ApplicationError("Unknown error", error)
  );
};

const createHeader: Interpreter["createHeader"] = function (headers) {
  return new Headers(headers);
};

// @ts-expect-error
const isRequest: Interpreter["isRequest"] = function (request) {
  return request instanceof Request;
};

// @ts-expect-error
const isResponse: Interpreter["isResponse"] = function (response) {
  return response instanceof Response;
};

export function run<E, A>(
  effect: RequestEffectT<E, A>,
  interceptors?: Array<Interceptor>
) {
  return pipe(
    effect,
    Effect.provideService(
      Interpreter,
      Interpreter.of({
        isRequest,
        isResponse,
        createHeader,
        execute(input, init) {
          return pipe(
            executor(new Request(input, init), interceptors),
            Effect.provideService(Interpreter, {
              isRequest,
              isResponse,
              createHeader,
              execute: fetch_,
            })
          );
        },
      })
    )
  );
}

export const execute = flow(run, Effect.runPromiseEither);
