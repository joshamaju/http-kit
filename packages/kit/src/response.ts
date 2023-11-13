import { pipe } from "effect/Function";
import * as Predicate from "effect/Predicate";
import * as Effect from "effect/Effect";
import { Res } from "./types.js";

export class DecodeError {
  readonly _tag = "DecodeError";
  constructor(readonly response: Response, readonly message?: string) {}
}

export class StatusError {
  readonly _tag = "StatusError";
  constructor(readonly response: Response, readonly message?: string) {}
}

function to<B, E>(
  task: (a: Res) => Promise<B>,
  catcher: (response: Res, error: unknown) => E
) {
  return <R, E, A extends Res>(fx: Effect.Effect<R, E, A>) => {
    return pipe(
      fx,
      Effect.flatMap((res) =>
        Effect.tryPromise({
          try: () => task(res),
          catch: (e) => catcher(res, e),
        })
      )
    );
  };
}

export const toText = to(
  (res) => res.text(),
  (res) => new DecodeError(res, "Unable to decode Text")
);

export const toJson = to(
  (res) => res.json(),
  (res) => new DecodeError(res, "Unable to decode JSON")
);

export const toJsonT = <T>() =>
  to(
    (res) => res.json() as Promise<T>,
    (res) => new DecodeError(res, "Unable to decode JSON")
  );

export const toArrayBuffer = to(
  (res) => res.arrayBuffer(),
  (res) => new DecodeError(res, "Unable to decode to ArrayBuffer")
);

export const toBlob = to(
  (res) => res.blob(),
  (res) => new DecodeError(res, "Unable to decode to Blob")
);

export function filterStatus<A extends Res>(
  predicate: Predicate.Predicate<number>
) {
  return <R, E>(fx: Effect.Effect<R, E, A>) => {
    return pipe(
      fx,
      Effect.filterOrElse(
        (res) => predicate(res.status),
        (res) =>
          Effect.fail(
            new StatusError(res, `Received invalid status code: ${res.status}`)
          )
      )
    );
  };
}

export function filterStatusOk<R, E, A extends Res>(
  fx: Effect.Effect<R, E, A>
) {
  return pipe(
    fx,
    Effect.filterOrElse(
      (res) => res.ok,
      (res) => Effect.fail(new StatusError(res))
    )
  );
}
