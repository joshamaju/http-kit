import type * as Effect from "@effect/io/Effect";
import { Interpreter } from "./interpreter.js";

// export type Err = Error;

export abstract class Err {
  abstract readonly _tag: string;
  constructor(readonly message: string) {}
}

export type Req = Request;

export type Res = Response;

export type RequestEffectT<E = any, A = any> = Effect.Effect<Interpreter, E, A>;

export type RequestEffect = RequestEffectT<Err, Response>;
