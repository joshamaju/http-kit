import * as Ctx from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import { Res, Req } from "./types.js";
import { Err } from "./exception.js";

export type Executor = (request: Req) => Effect.Effect<never, Err, Res>;

export interface Interpreter {
  execute: Executor;
  // newURL: (url: string) => URL;
  // isRequest(request: unknown): request is Request;
  isResponse: (response: unknown) => response is Response;
  newHeaders: (headers?: RequestInit["headers"]) => Headers;
  // newRequest(input: RequestInfo | URL, init?: RequestInit | undefined): Request;
}

export const Interpreter = Ctx.Tag<Interpreter>();
