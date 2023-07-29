import * as Ctx from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import { Res, Req } from "./types.js";
import { Err } from "./exception.js";

export type Executor = (request: Req) => Effect.Effect<never, Err, Res>;

export interface Adapter {
  execute: Executor;
  isResponse: (response: unknown) => response is Response;
  newHeaders: (headers?: RequestInit["headers"]) => Headers;
}

export const Adapter = Ctx.Tag<Adapter>();
