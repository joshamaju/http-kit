import * as Kit from "http-kit";
import * as Fetch from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import * as ReqKit from "http-kit/request";
import * as ResKit from "http-kit/response";

import * as S from "@effect/schema/Schema";

import { Effect, Logger, LoggerLevel, pipe } from "effect";

const User = S.struct({
  id: S.number,
  email: S.string,
  avatar: S.string,
  last_name: S.string,
  first_name: S.string,
});

type User = S.To<typeof User>;

const api = "https://reqres.in/api";

function getUsers(page?: number) {
  return pipe(
    ReqKit.get(`${api}/users/?age=10`, { search: searchParams({ page }) }),
    ResKit.filterStatusOk(),
    ResKit.toJson<{ data: User[] }>(),
    Effect.map((_) => _.data),
    Effect.flatMap(S.parse(S.array(User))),
    Effect.tap((data) => Effect.sync(() => console.log(data))),
    Effect.catchAllCause(Effect.logError)
  );
}

Effect.runFork(
  pipe(
    getUsers(2),
    Effect.provideSomeLayer(Kit.makeLayer(Fetch.adapter)),
    Logger.withMinimumLogLevel(LoggerLevel.Debug)
  )
);
