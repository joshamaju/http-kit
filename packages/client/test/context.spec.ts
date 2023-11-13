import { it } from "vitest";

import * as Fetch from "http-kit/fetch";
import * as Res from "http-kit/response";

import * as Context from "effect/Context";
import { pipe } from "effect/Function";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LoggerLevel from "effect/LogLevel";

import { HttpClient } from "../src/client.js";
import { Builder } from "../src/builder.js";
import { User } from "./types.js";

interface Storage {
  get(key: string): string | null;
}

const Storage = Context.Tag<Storage>("storage");

const StorageLive = Layer.succeed(
  Storage,
  Storage.of({ get: (key) => `${key}: ` })
);

function getUsers() {
  return Effect.gen(function* (_) {
    const storage = yield* _(Storage);
    const http = yield* _(HttpClient);

    return yield* _(
      http.get("/users"),
      Res.toJsonT<{ page: number; data: Array<User> }>(),
      Effect.tap((user) => Effect.log(storage.get(user.page.toString())))
    );
  });
}

it("should provide dependencies", async ({ expect }) => {
  const client = new Builder()
    .setBaseUrl("https://reqres.in/api")
    .setAdapter(Fetch.adapter)
    .build();

  const live = Layer.merge(StorageLive, client.makeLayer());

  const result = await pipe(
    getUsers(),
    Effect.provide(live),
    Logger.withMinimumLogLevel(LoggerLevel.Debug),
    Effect.runPromiseExit
  );

  expect(Exit.isSuccess(result)).toBeTruthy();
}, 10000);
