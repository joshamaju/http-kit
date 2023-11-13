import * as Ctx from "effect/Context";
import * as Effect from "effect/Effect";
import { Res, Req } from "./types.js";
import { HttpError } from "./exception.js";

export type Executor = (request: Req) => Effect.Effect<never, HttpError, Res>;

export interface Adapter {
  execute: Executor;
  isResponse: (response: unknown) => response is Response;
  newHeaders: (headers?: RequestInit["headers"]) => Headers;
}

export const Adapter = Ctx.Tag<Adapter>();
