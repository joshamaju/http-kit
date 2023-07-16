import { Err, request } from "http-kit";
import * as Fetcher from "http-kit/fetch";
import { searchParams } from "http-kit/function";
import { JsonParseError, filterStatusOk, parseJson } from "http-kit/response";

import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Logger from "@effect/io/Logger";
import * as Request from "@effect/io/Request";
import * as RequestResolver from "@effect/io/RequestResolver";
import * as LoggerLevel from "@effect/io/Logger/Level";
import { json } from "http-kit/body";

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
      parseJson<{ data: User[] }>(),
      Effect.map((res) => res.data)
    );
  }

  static getUser(id: number) {
    return pipe(
      request(`https://reqres.in/api/users/${id}`),
      filterStatusOk(),
      parseJson<{ data: User }>(),
      Effect.map((res) => res.data)
    );
  }

  static sendEmail(payload: { address: string; text: string }) {
    return pipe(
      request("https://api.example.demo/sendEmailBatch", {
        method: "POST",
        body: json(payload),
      }),
      filterStatusOk()
    );
  }
}

interface GetUsers extends Request.Request<Err | JsonParseError, User[]> {
  readonly _tag: "GetUsers";
  readonly page?: number;
}

interface GetUserById extends Request.Request<Err | JsonParseError, User> {
  readonly _tag: "GetUserById";
  readonly id: number;
}

const GetUsers = Request.tagged<GetUsers>("GetUsers");

const GetUserById = Request.tagged<GetUserById>("GetUserById");

interface SendEmail extends Request.Request<Err | JsonParseError, void> {
  readonly _tag: "SendEmail";
  readonly address: string;
  readonly text: string;
}

const SendEmail = Request.tagged<SendEmail>("SendEmail");

const GetUsersResolver = RequestResolver.fromFunctionEffect(
  (request: GetUsers) => Fetcher.provide(ReqRes.getUsers(request.page))
);

const GetUserByIdResolver = RequestResolver.makeBatched(
  (requests: GetUserById[]) => {
    return pipe(
      Effect.forEach(requests, (req) => ReqRes.getUser(req.id)),
      Effect.flatMap((users) => {
        return Effect.forEachWithIndex(requests, (req, i) => {
          return Request.completeEffect(req, Effect.succeed(users[i]));
        });
      }),
      Effect.catchAll((error) => {
        return Effect.forEach(requests, (request) => {
          return Request.completeEffect(request, Effect.fail(error));
        });
      }),
      Fetcher.provide
    );
  }
);

const SendEmailResolver = RequestResolver.makeBatched(
  (requests: SendEmail[]) => {
    return pipe(
      Effect.forEach(requests, (req) => ReqRes.sendEmail(req)),
      Effect.flatMap(() => {
        return Effect.forEach(requests, (request) => {
          return Request.completeEffect(request, Effect.unit());
        });
      }),
      Effect.catchAll((error) => {
        return Effect.forEach(requests, (request) => {
          return Request.completeEffect(request, Effect.fail(error));
        });
      }),
      Fetcher.provide
    );
  }
);

const getUsers = Effect.request(GetUsers({}), GetUsersResolver);

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
  Effect.flatMap(Effect.forEachDiscard(notifyOwner))
);

Effect.runFork(program);
