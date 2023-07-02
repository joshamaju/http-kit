import { request } from "http-kit";
import * as Fetcher from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import { filterStatusOk, parseJson, StatusError } from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Duration from "@effect/data/Duration";

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
      request("https://reqres.in/api/users/", {
        search: searchParams({ page }),
      }),
      filterStatusOk(),
      parseJson<{ data: User }>(),
      Effect.map((res) => res.data),
      // Effect.catchTag("StatusError", (e) => {
      //   return Effect.succeed("");
      // }),
      Effect.tapError((err) => {
        console.log("error: ", err);
        return Effect.unit();
      }),
      Effect.tap((data) => {
        console.log("data: ", data);
        return Effect.unit();
      })
    );
  }
}

console.log(
  Effect.runFork(
    Fetcher.run(ReqRes.getUsers(2), [
      {
        name: "custom-interceptor",
        request(req) {
          return pipe(
            Effect.succeed(new Response(JSON.stringify({ data: { a: 1 } }))),
            Effect.delay(Duration.seconds(5))
          );
        },
      },
      {
        request(req) {
          return Effect.gen(function* (_) {
            const res = yield* _(
              request("https://reqres.in/api/users/2"),
              parseJson()
            );

            console.log("res: ", res);

            const ares = yield* _(
              request("https://reqres.in/api/users/23"),
              filterStatusOk(),
              parseJson()
            );

            console.log("ares: ", ares);

            return new Request("https://reqres.in/api/users/2");
            // return req;
          });
        },
      },
    ])
  )
);

// Effect(Effect.succeed(10))

// console.log(Effect.runSync(Effect.succeed(10000)));
