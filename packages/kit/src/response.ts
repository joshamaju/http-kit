import { pipe } from "@effect/data/Function";
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
  return <A extends Res, R, E>(effect: Effect.Effect<R, E, A>) => {
    return pipe(
      effect,
      Effect.flatMap((res) =>
        Effect.tryCatchPromise(
          () => res.json() as Promise<T>,
          () => new JsonParseError(res, "Unable to parse JSON")
        )
      )
    );
  };
}

export function filterStatus<A extends Res>(func: (status: number) => boolean) {
  return <R, E>(effect: Effect.Effect<R, E, A>) => {
    return pipe(
      effect,
      Effect.filterOrElseWith(
        (res) => func(res.status),
        (res) => {
          return Effect.fail(
            new StatusError(res, `Received invalid status code: ${res.status}`)
          );
        }
      )
    );
  };
}

export function filterStatusOk() {
  return filterStatus((status) => status >= 200 && status < 300);
}
