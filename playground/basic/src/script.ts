import * as Fetcher from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import * as Req from "http-kit/request";
import { filterStatusOk, parseJson } from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as LogLevel from "@effect/io/Logger/Level";

interface User {
  id: number;
  email: string;
  avatar: string;
  last_name: string;
  first_name: string;
}

class ReqRes {
  static getUsers(page?: number) {
    return pipe(
      Req.get("/api/users/", {
        search: searchParams({ page }),
      }),
      filterStatusOk(),
      parseJson<{ data: User }>(),
      Effect.map((res) => res.data),
      Effect.tap((data) => Effect.log(JSON.stringify(data))),
      Effect.catchAllCause(Effect.logErrorCause)
    );
  }
}

export function isAbsolute(u: string): boolean {
  return u.indexOf("http://") === 0 || u.indexOf("https://") === 0;
}

Effect.runFork(
  pipe(
    Fetcher.provide(ReqRes.getUsers(2), [
      {
        request(req) {
          const clone = req.clone();

          const headers = new Headers(clone.init.headers);

          headers.set("Authorization", "Bearer token");

          const url = isAbsolute(clone.url)
            ? clone.url
            : new URL(clone.url, "https://reqres.in");

          return Effect.succeed(
            new Req.Request(url, { ...clone.init, headers })
          );
        },
        response(res) {
          return Effect.succeed(res);
        },
      },
    ]),
    Logger.withMinimumLogLevel(LogLevel.Debug)
  )
);
