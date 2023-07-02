import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";

import { Body as ReqBody } from "./body/types.js";
import { isBody } from "./body/util.js";
import { Interpreter } from "./interpreter.js";
import { RequestEffect } from "./types.js";

type RequestInput = string | URL;

export type ReqInit = RequestInit & {
  search?: string;
  body?: BodyInit | ReqBody;
};

export function request(
  input: RequestInput,
  init: ReqInit | undefined = {}
): RequestEffect {
  return pipe(
    Interpreter,
    Effect.flatMap((interpreter) => {
      const url = typeof input === "string" ? new URL(input) : input;

      if (init?.search) url.search = init.search;

      let new_init = { ...init };

      if (new_init) {
        let new_body = new_init.body;

        if (isBody(new_body)) {
          const headers = interpreter.createHeader(new_init.headers);

          for (const key in new_body?.headers) {
            if (Object.prototype.hasOwnProperty.call(new_body.headers, key)) {
              if (!headers.has(key)) headers.set(key, new_body.headers[key]);
            }
          }

          new_init.headers = headers;
          new_init.body = new_body.value;
        }
      }

      return interpreter.execute(url, new_init);
    })
  );
}
