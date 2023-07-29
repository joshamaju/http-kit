import * as Fetch from "http-kit/fetch";
import * as Http from "http-kit";
import { searchParams } from "http-kit/function";
import * as Req from "http-kit/request";
import { filterStatusOk, toJson } from "http-kit/response";

// import { pipe } from "@effect/data/Function";
// import * as Context from "@effect/data/Context";
// import * as Option from "@effect/data/Option";
// import * as Effect from "@effect/io/Effect";
// import * as Logger from "@effect/io/Logger";
// import * as LogLevel from "@effect/io/Logger/Level";

import * as S from "@effect/schema/Schema";

import { Effect, Option, Context, pipe, Logger, LoggerLevel } from "effect";

import * as Log from "effect-log";
import { HttpRequest } from "http-kit/request";

// interface User {
//   id: number;
//   email: string;
//   avatar: string;
//   last_name: string;
//   first_name: string;
// }

const User = S.struct({
  id: S.number,
  email: S.string,
  avatar: S.string,
  last_name: S.string,
  first_name: S.string,
});

type User = S.To<typeof User>;

class ReqRes {
  static getUsers(page?: number) {
    return pipe(
      Req.get("/api/users/?age=10", {
        search: searchParams({ page }),
      }),
      filterStatusOk(),
      toJson<{ data: User[] }>(),
      Effect.map((res) => res.data),
      Effect.tap((data) => Effect.log(JSON.stringify(data))),
      Effect.flatMap((user) => Req.get(`/api/users/${user[0].id}`)),
      filterStatusOk(),
      toJson<{ data: User }>(),
      Effect.flatMap(S.parse(User))
      // Effect.tap((data) => Effect.log(JSON.stringify(data))),
      // Effect.catchAllCause(Effect.logError)
    );
  }
}

export function isAbsolute(u: string): boolean {
  return u.indexOf("http://") === 0 || u.indexOf("https://") === 0;
}

interface Store {
  get(): Option.Option<string>;
}

const Store = Context.Tag<Store>();

const StoreLive = Store.of({ get: () => Option.some("") });

// function get() {
//   return pipe(
//     Req.get("/api/users/?age=10"),
//     filterStatusOk(),
//     toJson<{ data: User }>(),
//     Effect.flatMap((d) => {
//       return Effect.flatMap(Store, (store) => Effect.sync(() => store.get()));
//     })
//   );
// }

let n = pipe(
  Req.get("/api/users/?age=10"),
  filterStatusOk(),
  toJson<{ data: User }>(),
  Effect.flatMap((d) => {
    return Effect.flatMap(Store, (store) => Effect.sync(() => store.get()));
  })
);

let m = pipe(
  n,
  // Effect.provideService(Store, StoreLive),
  Http.provide(Fetch.adapter, { request: (req) => Effect.succeed(req) })
  // Effect.runPromise
);

// const res = pipe(
//   Fetcher.withInterceptors([])(get()),
//   Effect.provideService(Store, StoreLive),
//   Logger.withMinimumLogLevel(LogLevel.Debug),
//   Effect.runPromise
// );

// const res = pipe(
//   get(),
//   Fetch.provide,
//   Effect.provideService(Store, StoreLive),
//   Logger.withMinimumLogLevel(LogLevel.Debug),
//   Effect.runPromise
// );

Effect.runFork(
  pipe(
    ReqRes.getUsers(2),
    Http.provide(
      Fetch.adapter,
      {
        request(req) {
          return Effect.gen(function* (_) {
            const clone = req.clone();

            const headers = new Headers(clone.init.headers);

            headers.set("Authorization", "Bearer token");

            const url = isAbsolute(clone.url)
              ? clone.url
              : new URL(clone.url, "https://reqres.in");

            const res = yield* _(Req.request(url, clone.init));

            console.log("res: ", res);

            return res;
          });

          // return Req.request(url, clone.init);
        },
        response(res) {
          return Effect.succeed(res);
        },
      },
      {
        request(req) {
          console.warn("intercept");
          return Effect.succeed(req);
        },
      }
    ),
    Effect.provideLayer(Logger.replace(Logger.defaultLogger, Log.pretty)),
    Logger.withMinimumLogLevel(LoggerLevel.Debug)
  )
);
