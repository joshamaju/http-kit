import * as Effect from "@effect/io/Effect";
import type { Req, Res } from "../types.js";
import type { Interpreter } from "../interpreter.js";
import { Err } from "../exception.js";

export interface RequestInterceptor {
  (req: Req): Effect.Effect<Interpreter, Err, Req | Res>;
}

export interface ResponseInterceptor {
  (res: Res, req: Req): Effect.Effect<Interpreter, Err, Res>;
}

export type Interceptor = {
  readonly name?: string;
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
} & (
  | {
      request: RequestInterceptor;
    }
  | {
      response: ResponseInterceptor;
    }
);
