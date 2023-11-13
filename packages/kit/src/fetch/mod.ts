import * as Effect from "effect/Effect";
import { HttpError } from "../exception.js";
import { Executor, Adapter } from "../interpreter.js";

const fetch_: Executor = (req) => {
  return Effect.tryPromise({
    try: (signal) => fetch(req.url, { ...(req.init as RequestInit), signal }),
    catch: (error) => new HttpError(error),
  });
};

const newHeaders: Adapter["newHeaders"] = function (headers) {
  return new Headers(headers);
};

// @ts-expect-error
const isResponse: Adapter["isResponse"] = function (response) {
  return response instanceof Response;
};

export const adapter: Adapter = { isResponse, newHeaders, execute: fetch_ };
