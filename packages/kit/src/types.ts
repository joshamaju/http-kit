import type * as Effect from "@effect/io/Effect";
import { Interpreter } from "./interpreter.js";
import { Err } from "./exception.js";
import { HttpRequest } from "./request/Request.js";

export type Req = HttpRequest;

export type Res = Response;

export type RequestEffectT<E = any, A = any> = Effect.Effect<Interpreter, E, A>;

export type RequestEffect = RequestEffectT<Err, Response>;
