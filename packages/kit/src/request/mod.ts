import * as Effect from "@effect/io/Effect";

import { isBody } from "../body/util.js";
import { Interpreter } from "../interpreter.js";
import { RequestEffect } from "../types.js";
import { Request, RequestInit_ } from "./Request.js";

export function request(
  input: Request | string | URL,
  init: RequestInit_ | undefined = {}
): RequestEffect {
  return Effect.flatMap(Interpreter, (interpreter) => {
    const url =
      typeof input === "string"
        ? interpreter.newURL(input)
        : input instanceof Request
        ? interpreter.newURL(input.url)
        : input;

    let init_ = input instanceof Request ? input.init : init;

    if (init_) {
      if (init_.search) url.search = init_.search;

      if (isBody(init_.body)) {
        const body = init_.body;

        const headers = interpreter.newHeaders(init_.headers);

        for (const key in body.headers) {
          if (Object.prototype.hasOwnProperty.call(body.headers, key)) {
            if (!headers.has(key)) headers.set(key, body.headers[key]);
          }
        }

        init_.headers = headers;
        init_.body = body.value;
      }
    }

    return interpreter.execute(new Request(url, init_));
  });
}

function make(method: RequestInit_["method"]) {
  return (
    input: string | URL,
    init: Omit<RequestInit_, "method"> | undefined = {}
  ) => request(input, { ...init, method });
}

function make2(method: RequestInit_["method"]) {
  return (
    input: string | URL,
    body: RequestInit_["body"],
    init: Omit<RequestInit_, "method" | "body"> | undefined = {}
  ) => request(input, { ...init, body, method });
}

export const get = make("GET");

export const post = make2("POST");

export const put = make2("PUT");

export const head = make("HEAD");

export const options = make("OPTIONS");

export const patch = make("PATCH");

const delete_ = make("DELETE");

export { delete_ as delete };
