import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";
import { searchParams } from "http-kit/function";

import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/LogLevel";

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
      Http.get("https://reqres.in/api/users/", {
        search: searchParams({ page }),
      }),
      Http.filterStatusOk,
      Http.toJson,
      Effect.map((res) => res.data),
      Effect.tap((data) => Effect.sync(() => console.log(data))),
      Effect.catchAllCause(Effect.logError)
    );
  }
}

pipe(
  ReqRes.getUsers(2),
  Http.provide(Fetch.adapter, logger),
  Logger.withMinimumLogLevel(LoggerLevel.Debug),
  Effect.runFork
);
