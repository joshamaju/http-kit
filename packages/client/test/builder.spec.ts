import { describe, it } from "vitest";
import { inspect } from "node:util";

import * as Http from "http-kit";
import * as Res from "http-kit/response";
import * as Fetch from "http-kit/fetch";

import * as Exit from "@effect/io/Exit";
import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as LoggerLevel from "@effect/io/Logger/Level";
import { pipe } from "@effect/data/Function";
import * as Either from "@effect/data/Either";

import { Builder } from "../src/builder.js";

function getUsers() {
  return pipe(Http.get("/users"), Res.toJsonT<{ age: number }>());
}

describe("Builder", () => {
  it("should create client", async ({ expect }) => {
    const client = new Builder()
      .setBaseUrl("https://reqres.in/api")
      .setAdapter(Fetch.adapter)
      .build();

    const result = await pipe(
      getUsers(),
      client.make,
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
