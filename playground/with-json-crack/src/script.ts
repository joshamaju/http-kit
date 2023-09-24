import * as Http from "http-kit";
import * as Fetch from "http-kit/fetch";

import * as S from "@effect/schema/Schema";

import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";
import * as Duration from "@effect/data/Duration";
import * as LoggerLevel from "@effect/io/LogLevel";

const User = S.struct({
  id: S.number,
  email: S.string,
  avatar: S.string,
  last_name: S.string,
  first_name: S.string,
});

const jsonCrackEmbed = document.getElementById("jsoncrackEmbed");

const getUser = pipe(
  Http.get("https://reqres.in/api/users"),
  Http.filterStatusOk,
  Http.toJson,
  Effect.map((_) => _.data),
  // Effect.flatMap(S.parse(User)),
  Effect.tap((data) => Effect.sync(() => console.log(data))),
  Effect.tapErrorCause((error) => Effect.sync(() => console.error(error))),
  Effect.tap((data) =>
    Effect.sync(() => {
      // @ts-expect-error
      jsonCrackEmbed?.contentWindow.postMessage(
        {
          json: JSON.stringify({
            links: {
              self: "http://example.com/articles",
              next: "http://example.com/articles?page[offset]=2",
              last: "http://example.com/articles?page[offset]=10",
            },
            data: [
              {
                type: "articles",
                id: "1",
                attributes: {
                  title: "JSON:API paints my bikeshed!",
                },
                relationships: {
                  author: {
                    links: {
                      self: "http://example.com/articles/1/relationships/author",
                      related: "http://example.com/articles/1/author",
                    },
                    data: { type: "people", id: "9" },
                  },
                  comments: {
                    links: {
                      self: "http://example.com/articles/1/relationships/comments",
                      related: "http://example.com/articles/1/comments",
                    },
                    data: [
                      { type: "comments", id: "5" },
                      { type: "comments", id: "12" },
                    ],
                  },
                },
                links: {
                  self: "http://example.com/articles/1",
                },
              },
            ],
            included: [
              {
                type: "people",
                id: "9",
                attributes: {
                  firstName: "Dan",
                  lastName: "Gebhardt",
                  twitter: "dgeb",
                },
                links: {
                  self: "http://example.com/people/9",
                },
              },
              {
                type: "comments",
                id: "5",
                attributes: {
                  body: "First!",
                },
                relationships: {
                  author: {
                    data: { type: "people", id: "2" },
                  },
                },
                links: {
                  self: "http://example.com/comments/5",
                },
              },
              {
                type: "comments",
                id: "12",
                attributes: {
                  body: "I like XML better",
                },
                relationships: {
                  author: {
                    data: { type: "people", id: "9" },
                  },
                },
                links: {
                  self: "http://example.com/comments/12",
                },
              },
            ],
          }),
          options: {
            theme: "light", // "light" or "dark"
            direction: "RIGHT", // "UP", "DOWN", "LEFT", "RIGHT"
          },
        },
        "*"
      );
    })
  )
);

pipe(
  getUser,
  Effect.delay(Duration.seconds(5)),
  Http.provide(Fetch.adapter),
  Logger.withMinimumLogLevel(LoggerLevel.Debug),
  Effect.runFork
);
