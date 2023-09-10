import * as Effect from "@effect/io/Effect";
import type { Req, Res } from "../types.js";
import type { Adapter } from "../interpreter.js";
import { HttpError } from "../exception.js";
import { HttpRequest } from "../request/Request.js";

export interface RequestInterceptor {
  (req: HttpRequest): Effect.Effect<Adapter, HttpError, Req | Res>;
}

export interface ResponseInterceptor {
  (res: Res, req: HttpRequest): Effect.Effect<Adapter, HttpError, Res>;
}

export type Interceptor = {
  readonly name?: string;
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
} & ({ request: RequestInterceptor } | { response: ResponseInterceptor });
