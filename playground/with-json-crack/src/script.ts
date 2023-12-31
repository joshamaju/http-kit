import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";

import * as Effect from "effect/Effect";
import * as Logger from "effect/Logger";
import { pipe } from "effect/Function";
import * as LoggerLevel from "effect/LogLevel";

const jsonCrackEmbed = document.getElementById("jsoncrackEmbed");

const getUser = pipe(
  Http.get("https://dummyjson.com/products/1"),
  Http.filterStatusOk,
  Http.toJson,
  Effect.tap((data) => Effect.sync(() => console.log(data))),
  Effect.tapErrorCause((error) => Effect.sync(() => console.error(error))),
  Effect.tap((data) =>
    Effect.sync(() => {
      // @ts-expect-error
      jsonCrackEmbed?.contentWindow.postMessage(
        {
          json: JSON.stringify(data),
          options: { theme: "light", direction: "RIGHT" },
        },
        "*"
      );
    })
  )
);

pipe(
  getUser,
  Http.provide(Fetch.adapter),
  Logger.withMinimumLogLevel(LoggerLevel.Debug),
  Effect.runFork
);
