import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";

import * as S from "@effect/schema/Schema";

import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/LogLevel";

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

pipe(
  getUser,
  Http.provide(Fetch.adapter),
  Logger.withMinimumLogLevel(LoggerLevel.Debug),
  Effect.runFork
);
