import * as Effect from "@effect/io/Effect";
import { HttpError } from "../exception.js";
import { Executor, Interpreter } from "../interpreter.js";

const fetch_: Executor = (req) => {
  return Effect.tryCatchPromiseInterrupt(
    (signal) => fetch(req.url, { ...(req.init as RequestInit), signal }),
    (error) => new HttpError("Fetch error", error)
  );
};

const newHeaders: Interpreter["newHeaders"] = function (headers) {
  return new Headers(headers);
};

// @ts-expect-error
const isResponse: Interpreter["isResponse"] = function (response) {
  return response instanceof Response;
};

export const adapter: Interpreter = { isResponse, newHeaders, execute: fetch_ };
