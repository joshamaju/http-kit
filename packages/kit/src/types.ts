import type * as Effect from "effect/Effect";
import { HttpError } from "./exception.js";
import { Adapter } from "./interpreter.js";
import { HttpRequest } from "./request/Request.js";

export type Req = HttpRequest;

export type Res = Response;

export type RequestEffectT<E = any, A = any> = Effect.Effect<Adapter, E, A>;

export type RequestEffect = RequestEffectT<HttpError, Response>;
