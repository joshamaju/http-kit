import { pipe } from "@effect/data/Function";
import * as Predicate from "@effect/data/Predicate";
import * as Effect from "@effect/io/Effect";
import { HttpError } from "./exception.js";
import { Res } from "./types.js";

export class JsonParseError {
  readonly _tag = "JsonParseError";

  constructor(readonly response: Response, readonly message: string) {
    // super(message);
  }
}

export class StatusError {
  readonly _tag = "StatusError";

  constructor(readonly response: Response, readonly message: string) {
    // super(message);
  }
}

export function toJson<T>() {
  return <R, E, A extends Res>(fx: Effect.Effect<R, E, A>) => {
    return pipe(
      fx,
      Effect.flatMap((res) => {
        return Effect.tryPromise({
          try: () => res.json() as Promise<T>,
          catch: () => new JsonParseError(res, "Unable to parse JSON"),
        });
      })
    );
  };
}

function to<B>(fn: (a: Res) => Promise<B>) {
  return () =>
    <R, E, A extends Res>(effect: Effect.Effect<R, E, A>) => {
      return pipe(
        effect,
        Effect.flatMap((res) =>
          Effect.tryPromise({
            try: () => fn(res),
            catch: (e) => new HttpError("Decode error", e),
          })
        )
      );
    };
}

export const toText = to((res) => res.text());

export const toArrayBuffer = to((res) => res.arrayBuffer());

export const toBlob = to((res) => res.blob());

export function filterStatus<A extends Res>(func: Predicate.Predicate<number>) {
  return <R, E>(fx: Effect.Effect<R, E, A>) => {
    return pipe(
      fx,
      Effect.filterOrElse(
        (res) => func(res.status),
        (res) =>
          Effect.fail(
            new StatusError(res, `Received invalid status code: ${res.status}`)
          )
      )
    );
  };
}

export function filterStatusOk() {
  return filterStatus((status) => status >= 200 && status < 300);
}
