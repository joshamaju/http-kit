import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import { Body as ReqBody } from "./body/types.js";
import { isBody } from "./body/util.js";
import { Interpreter } from "./interpreter.js";
import { RequestEffect } from "./types.js";

type RequestInput = string | URL;

export type ReqInit = Omit<RequestInit, "body"> & {
  search?: string;
  body?: BodyInit | ReqBody;
};

export function request(
  input: RequestInput,
  { body, ...init }: ReqInit | undefined = {}
): RequestEffect {
  return Effect.flatMap(Interpreter, (interpreter) => {
    const url = typeof input === "string" ? new URL(input) : input;

    if (init?.search) url.search = init.search;

    let new_init = { ...init } as RequestInit;

    if (isBody(body)) {
      const headers = interpreter.createHeader(new_init.headers);

      for (const key in body?.headers) {
        if (Object.prototype.hasOwnProperty.call(body.headers, key)) {
          if (!headers.has(key)) headers.set(key, body.headers[key]);
        }
      }

      new_init.headers = headers;
      new_init.body = body.value;
    }

    return interpreter.execute(url, new_init);
  });
}

function make(method: ReqInit["method"]) {
  return (
    input: RequestInput,
    init: Omit<ReqInit, "method"> | undefined = {}
  ) => request(input, { ...init, method });
}

function make2(method: ReqInit["method"]) {
  return (
    input: RequestInput,
    body: ReqInit["body"],
    init: Omit<ReqInit, "method" | "body"> | undefined = {}
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
