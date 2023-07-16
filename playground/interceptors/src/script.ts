import { request } from "http-kit";
import * as Fetcher from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import { filterStatusOk, parseJson } from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/Logger/Level";

import logger from "./logger.js";

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
      Effect.map((res) => res.data)
    );
  }
}

Effect.runFork(
  pipe(
    Fetcher.provide(ReqRes.getUsers(2), [logger]),
    Logger.withMinimumLogLevel(LoggerLevel.None)
  )
);
