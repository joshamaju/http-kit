import * as Effect from "effect/Effect";
import { HttpRequest } from "../request/Request.js";
import type { Req, Res } from "../types.js";

export interface RequestInterceptor {
  (req: HttpRequest): Effect.Effect<never , never, Req | Res>;
}

export interface ResponseInterceptor {
  (res: Res, req: HttpRequest): Effect.Effect<never, never, Res>;
}

export type Interceptor = {
  readonly name?: string;
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
} & ({ request: RequestInterceptor } | { response: ResponseInterceptor });
