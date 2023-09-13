# Http Kit

## Features

- Supports interceptors
- Uses Native Web Platform APIs
- Type safety, correctly typed responses and errors
- Cross platform i.e Deno, Node etc using adapters

## Getting started

```bash
npm i http-kit @http-kit/client
npm i @effect/io @effect/data
```

```ts
import * as Http from "http-kit";
import * as HttpClient from "@http-kit/client";
import * as FetchAdapter from "http-kit/fetch";

const client = new HttpClient.Builder()
  .setBaseUrl("https://reqres.in/api")
  .setAdapter(FetchAdapter.adapter)
  .build();

const getUser = Effect.gen(function* (_) {
  const http = yield* _(HttpClient.HttpClient);

  return yield* _(
    http.get("/users/2"),
    Http.filterStatusOk,
    Http.toJson,
    Effect.map((_) => _.data),
    Effect.flatMap(S.parse(User))
  );
}).pipe(
  Effect.tap((data) => Effect.sync(() => console.log(data))),
  Effect.tapErrorCause((error) => Effect.sync(() => console.error(error)))
);

Effect.runFork(
  pipe(
    getUser,
    Effect.provideLayer(client.makeLayer()),
    Logger.withMinimumLogLevel(LoggerLevel.Debug)
  )
);
```

## Examples

[link](playground/basic)