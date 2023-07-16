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
  return pipe(
    Interpreter,
    Effect.flatMap((interpreter) => {
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
    })
  );
}
