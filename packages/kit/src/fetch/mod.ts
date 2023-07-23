import * as Effect from "@effect/io/Effect";
import { Interceptor } from "../execute/types.js";
import { pipe, flow } from "@effect/data/Function";
import { Executor, Interpreter } from "../interpreter.js";
import { execute as executor } from "../execute/mod.js";
import { RequestEffectT } from "../types.js";
import { ApplicationError, HttpError } from "../exception.js";

const fetch_: Executor = (req) => {
  return Effect.tryCatchPromiseInterrupt(
    (signal) => fetch(req.url, { ...(req.init as RequestInit), signal }),
    (error) =>
      error instanceof Error
        ? error.name === "NetworkError"
          ? new HttpError("Network error")
          : new ApplicationError(error.message)
        : new ApplicationError("Unknown error", error)
  );
};

const newHeaders: Interpreter["newHeaders"] = function (headers) {
  return new Headers(headers);
};

// const newURL: Interpreter["newURL"] = function (url) {
//   return new URL(url);
// };

// @ts-expect-error
const isResponse: Interpreter["isResponse"] = function (response) {
  return response instanceof Response;
};

const service: Interpreter = {
  // newURL,
  isResponse,
  newHeaders,
  execute: fetch_,
};

export function provide<E, A>(
  effect: RequestEffectT<E, A>,
  interceptors?: Array<Interceptor>
) {
  return pipe(
    effect,
    Effect.provideService(
      Interpreter,
      Interpreter.of({
        ...service,
        execute(request) {
          return pipe(
            executor(request, interceptors),
            Effect.provideService(Interpreter, service)
          );
        },
      })
    )
  );
}

export const execute = flow(provide, Effect.runPromiseEither);
