import { request } from "http-kit";
import * as Fetcher from "http-kit/fetch";
import * as Fiber from "@effect/io/Fiber";
import * as Either from "@effect/data/Either";
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
      // Effect.flatMap((data) => {
      //   console.log("step data: ", data);
      //   return pipe(
      //     request("https://reqres.in/api/users/23"),
      //     filterStatusOk(),
      //     parseJson<{ data: User }>(),
      //     Effect.flatMap((data) => {
      //       console.log("step 2 data: ", data);
      //       return pipe(
      //         request("https://reqres.in/api/users/2"),
      //         filterStatusOk(),
      //         parseJson<{ data: User }>()
      //       );
      //     })
      //   );
      // }),
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

// const fiber = Effect.runFork(
//   Fetcher.run(ReqRes.getUsers(2), [
//     // {
//     //   name: "custom-interceptor",
//     //   request(req) {
//     //     // return pipe(
//     //     //   Effect.succeed(new Response(JSON.stringify({ data: { a: 1 } }))),
//     //     //   Effect.delay(Duration.seconds(5))
//     //     // );
//     //     return Effect.delay(Effect.succeed(req), Duration.seconds(5));
//     //   },
//     // },
//     // {
//     //   request(req) {
//     //     return Effect.gen(function* (_) {
//     //       const res = yield* _(
//     //         request("https://reqres.in/api/users/2"),
//     //         parseJson()
//     //       );
//     //       console.log("res: ", res);
//     //       const ares = yield* _(
//     //         request("https://reqres.in/api/users/23"),
//     //         filterStatusOk(),
//     //         parseJson()
//     //       );
//     //       console.log("ares: ", ares);
//     //       return new Request("https://reqres.in/api/users/2");
//     //       // return req;
//     //     });
//     //   },
//     // },
//   ])
// );

// Effect.runFork(Effect.delay(Fiber.interrupt(fiber), Duration.seconds(5)));

// setTimeout(() => {
//   Effect.runFork(Fiber.interrupt(fiber));
// }, 200);

document.querySelector("button")?.addEventListener("click", () => {
  Effect.runFork(
    Fetcher.run(ReqRes.getUsers(2), [
      {
        request(req) {
          return Effect.gen(function* (s) {
            const a = yield* s(
              pipe(
                request("https://reqres.in/api/users/2"),
                filterStatusOk(),
                parseJson<{ a: number }>()
                // Effect.either,
                // Effect.map(
                //   Either.match(
                //     (err) => Effect.succeed("error"),
                //     (data) => {
                //       return Effect.succeed("data");
                //     }
                //   )
                // )
              )
            );

            console.log("a: ", a);
            return req;
          });
        },
      },
    ])
  );
});
