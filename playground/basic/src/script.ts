import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";

import * as S from "@effect/schema/Schema";

import { Effect, Logger, LoggerLevel, pipe } from "effect";

const User = S.struct({
  id: S.number,
  email: S.string,
  avatar: S.string,
  last_name: S.string,
  first_name: S.string,
});

const getUser = pipe(
  Http.get("https://reqres.in/api/users/20"),
  Http.filterStatusOk,
  Http.toJson,
  Effect.map((_) => _.data),
  Effect.flatMap(S.parse(User)),
  Effect.tap((data) => Effect.sync(() => console.log(data))),
  Effect.tapErrorCause((error) => Effect.sync(() => console.error(error)))
);

Effect.runFork(
  pipe(
    getUser,
    Http.provide(Fetch.adapter),
    Logger.withMinimumLogLevel(LoggerLevel.Debug)
  )
);
