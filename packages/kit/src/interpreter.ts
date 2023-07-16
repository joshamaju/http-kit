import * as Ctx from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import { Res } from "./types.js";
import { Err } from "./exception.js";

export type Executor = (
  input: RequestInfo | URL,
  init?: RequestInit | undefined
) => Effect.Effect<never, Err, Res>;

export interface Interpreter {
  execute: Executor;
  isRequest(request: unknown): request is Request;
  isResponse: (response: unknown) => response is Response;
  createHeader: (headers?: RequestInit["headers"]) => Headers;
}

export const Interpreter = Ctx.Tag<Interpreter>();
