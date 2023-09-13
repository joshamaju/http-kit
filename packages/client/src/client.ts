import {
  HttpError,
  Interceptor,
  StatusError,
  delete as delete_,
  filterStatusOk,
  get,
  head,
  patch,
  post,
  provide,
  put,
  request,
} from "http-kit";
import { Adapter } from "http-kit/interpreter";

import { Tag } from "@effect/data/Context";
import { flow } from "@effect/data/Function";
import { Effect, runPromise } from "@effect/io/Effect";
import { RequestInit_ } from "http-kit/request";
import { succeed } from "@effect/io/Layer";

interface Options {
  adapter: Adapter;
  interceptors: Array<Interceptor>;
}

type Handler = (
  input: string | URL,
  body: RequestInit_["body"],
  init?: Omit<RequestInit_, "method" | "body">
) => Effect<never, HttpError | StatusError, any>;

export const HttpClient = Tag<Client>("@http-kit/client/Client");

export class Client {
  constructor(private options: Options) {
    this.provide = this.provide.bind(this);
    this.execute = this.execute.bind(this);
  }

  request = flow(request, this.provide.bind(this));

  get = flow(get, filterStatusOk, this.provide.bind(this));

  delete = flow(delete_, filterStatusOk, this.provide.bind(this));

  patch = flow(patch, filterStatusOk, this.provide.bind(this));

  head = flow(head, filterStatusOk, this.provide.bind(this));

  post: Handler = flow(post, filterStatusOk, this.provide.bind(this));

  put: Handler = flow(put, filterStatusOk, this.provide.bind(this));

  provide<R, E, A>(request: Effect<R | Adapter, E, A>) {
    return provide(this.options.adapter, ...this.options.interceptors)(request);
  }

  makeLayer() {
    return succeed(HttpClient, this);
  }

  execute<E, A>(request: Effect<Adapter, E, A>) {
    return runPromise(this.provide(request));
  }
}
