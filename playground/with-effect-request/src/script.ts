import * as Http from "http-kit";
import { json } from "http-kit/body";
import * as Fetch from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import { filterStatusOk, toJsonT } from "http-kit/response";

import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as Schedule from "@effect/io/Schedule";
import * as Duration from "@effect/data/Duration";
import * as Request from "@effect/io/Request";
import * as RequestResolver from "@effect/io/RequestResolver";

interface User {
  id: number;
  email: string;
  avatar: string;
  last_name: string;
  first_name: string;
}

const url = "https://reqres.in/api/users";

class ReqRes {
  static getUsers(page?: number) {
    return pipe(
      Http.get(url, { search: searchParams({ page }) }),
      filterStatusOk,
      toJsonT<{ data: User[] }>(),
      Effect.map((res) => res.data)
    );
  }

  static getUser(id: number) {
    return pipe(
      Http.get(`${url}/${id}`),
      filterStatusOk,
      toJsonT<{ data: User }>(),
      Effect.map((res) => res.data)
    );
  }

  static sendEmail({ text, address }: { address: string; text: string }) {
    return pipe(
      Http.post(url, json({ name: text, job: address })),
      filterStatusOk
    );
  }
}

interface GetUsers
  extends Request.Request<
    Http.HttpError | Http.DecodeError | Http.StatusError,
    User[]
  > {
  readonly _tag: "GetUsers";
  readonly page?: number;
}

interface GetUserById
  extends Request.Request<
    Http.HttpError | Http.DecodeError | Http.StatusError,
    User
  > {
  readonly _tag: "GetUserById";
  readonly id: number;
}

const GetUsers = Request.tagged<GetUsers>("GetUsers");

const GetUserById = Request.tagged<GetUserById>("GetUserById");

interface SendEmail
  extends Request.Request<
    Http.HttpError | Http.DecodeError | Http.StatusError,
    void
  > {
  readonly _tag: "SendEmail";
  readonly address: string;
  readonly text: string;
}

const SendEmail = Request.tagged<SendEmail>("SendEmail");

const GetUsersResolver = RequestResolver.fromFunctionEffect(
  (request: GetUsers) =>
    pipe(ReqRes.getUsers(request.page), Http.provide(Fetch.adapter))
);

const GetUserByIdResolver = RequestResolver.makeBatched(
  (requests: GetUserById[]) => {
    return pipe(
      Effect.forEach(requests, (req) => ReqRes.getUser(req.id)),
      Effect.flatMap((users) => {
        return Effect.forEach(requests, (req, i) => {
          return Request.completeEffect(req, Effect.succeed(users[i]));
        });
      }),
      Effect.catchAll((error) => {
        return Effect.forEach(requests, (request) => {
          return Request.completeEffect(request, Effect.fail(error));
        });
      }),
      Http.provide(Fetch.adapter)
    );
  }
);

const SendEmailResolver = RequestResolver.makeBatched(
  (requests: SendEmail[]) => {
    return pipe(
      Effect.forEach(requests, (req) => ReqRes.sendEmail(req)),
      Effect.flatMap(() => {
        return Effect.forEach(requests, (request) => {
          return Request.completeEffect(request, Effect.unit);
        });
      }),
      Effect.catchAll((error) => {
        return Effect.forEach(requests, (request) => {
          return Request.completeEffect(request, Effect.fail(error));
        });
      }),
      Http.provide(Fetch.adapter)
    );
  }
);

const getUsers = Effect.request(GetUsers({ page: 1 }), GetUsersResolver);

const getUserById = (id: number) =>
  Effect.request(GetUserById({ id }), GetUserByIdResolver);

const sendEmail = (address: string, text: string) =>
  Effect.request(SendEmail({ address, text }), SendEmailResolver);

const sendEmailToUser = (id: number, message: string) =>
  pipe(
    getUserById(id),
    Effect.flatMap((user) => sendEmail(user.email, message))
  );

const notifyOwner = (user: User) =>
  pipe(
    getUserById(user.id),
    Effect.flatMap((user) =>
      sendEmailToUser(user.id, `hey ${user.first_name} you got a todo!`)
    )
  );

const program = pipe(
  getUsers,
  Effect.flatMap(
    Effect.forEach(notifyOwner, { concurrency: "unbounded", discard: true })
  ),
  Effect.repeat(Schedule.fixed(Duration.seconds(10))),
  Effect.catchAll((err) => {
    console.log(err);
    return Effect.fail("☠️");
  })
);

Effect.runFork(program);
