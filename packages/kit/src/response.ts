import { pipe } from "@effect/data/Function";
import * as Predicate from "@effect/data/Predicate";
import * as Effect from "@effect/io/Effect";
import { Err } from "./exception.js";
import { Res } from "./types.js";

export class JsonParseError extends Err {
  readonly _tag = "JsonParseError";

  constructor(readonly response: Response, readonly message: string) {
    super(message);
  }
}

export class StatusError extends Err {
  readonly _tag = "StatusError";

  constructor(readonly response: Response, readonly message: string) {
    super(message);
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
