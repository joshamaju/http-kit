import * as Effect from "effect/Effect";

import { isBody } from "../body/util.js";
import { Adapter } from "../interpreter.js";
import { RequestEffect } from "../types.js";
import { HttpRequest, RequestInit_ } from "./Request.js";

export function request(
  input: HttpRequest | string | URL,
  init: RequestInit_ | undefined = {}
): RequestEffect {
  return Effect.flatMap(Adapter, (adapter) => {
    let url =
      input instanceof HttpRequest
        ? input.url
        : typeof input === "string"
        ? input
        : input.toString();

    let init_ = input instanceof HttpRequest ? input.init : init;

    if (init_.search) {
      url += (url.indexOf("?") === -1 ? "?" : "&") + init_.search;
    }

    if (isBody(init_.body)) {
      const body = init_.body;

      const headers = adapter.newHeaders(init_.headers);

      for (const key in body.headers) {
        if (Object.prototype.hasOwnProperty.call(body.headers, key)) {
          if (!headers.has(key)) headers.set(key, body.headers[key]);
        }
      }

      init_.headers = headers;
      init_.body = body.value;
    }

    return adapter.execute(new HttpRequest(url, init_));
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
