import { beforeEach, describe, it } from "vitest";

import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";
import * as Res from "http-kit/response";

import * as Either from "effect/Either";
import { pipe } from "effect/Function";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Logger from "effect/Logger";
import * as LoggerLevel from "effect/LogLevel";

import { Client } from "src/client.js";
import { Builder } from "../src/builder.js";
import { User } from "./types.js";

function getUsers() {
  return pipe(
    Http.get("/users"),
    Res.toJsonT<{ page: number; data: Array<User> }>()
  );
}

describe("Builder", () => {
  it("should create client", async ({ expect }) => {
    const client = new Builder()
      .setBaseUrl("https://reqres.in/api")
      .setAdapter(Fetch.adapter)
      .build();

    const result = await pipe(
      getUsers(),
      client.provide,
      Effect.tap(Effect.logDebug),
      Effect.tapError(Effect.logFatal),
      Logger.withMinimumLogLevel(LoggerLevel.Debug),
      Effect.runPromiseExit
    );

    expect(Exit.isSuccess(result)).toBeTruthy();
  }, 10000);

  it("should not create client because of missing adapter", async ({
    expect,
  }) => {
    const builder = new Builder().setBaseUrl("https://reqres.in/api");
    expect(() => builder.build()).toThrow();
  });

  it("request should fail because of invalid URL", async ({ expect }) => {
    const client = new Builder().setAdapter(Fetch.adapter).build();

    const result = await pipe(getUsers(), Effect.either, client.execute);

    expect(Either.isLeft(result)).toBeTruthy();

    expect((result as Either.Left<any, any>).left).toBeInstanceOf(
      Http.HttpError
    );
  });
});

describe("Client handlers", () => {
  let client: Client;

  beforeEach(() => {
    client = new Builder()
      .setBaseUrl("https://reqres.in/api")
      .setAdapter(Fetch.adapter)
      .build();
  });

  it("get/post handlers", async ({ expect }) => {
    const result = await pipe(
      client.get("/users"),
      Res.toJson,
      Effect.either,
      Effect.runPromise
    );

    expect(Either.isRight(result)).toBeTruthy();
  });
});
