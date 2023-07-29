import * as Kit from "http-kit";
import * as Fetch from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import * as ResKit from "http-kit/response";

import { Effect, Logger, LoggerLevel, pipe } from "effect";

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
      Kit.get("https://reqres.in/api/users/", {
        search: searchParams({ page }),
      }),
      ResKit.filterStatusOk(),
      ResKit.toJson<{ data: User[] }>(),
      Effect.map((res) => res.data),
      Effect.tap((data) => Effect.sync(() => console.log(data))),
      Effect.catchAllCause(Effect.logError)
    );
  }
}

Effect.runFork(
  pipe(
    ReqRes.getUsers(2),
    Kit.provide(Fetch.adapter, logger),
    Logger.withMinimumLogLevel(LoggerLevel.None)
  )
);
