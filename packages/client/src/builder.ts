import { Interceptor } from "http-kit";
import { Adapter } from "http-kit/interpreter";

import * as Effect from "@effect/io/Effect";
import * as O from "@effect/data/Option";
import { pipe } from "@effect/data/Function";

import { Client } from "./client.js";
import { HttpRequest } from "http-kit/request";

interface Options {
  url?: string | null;
  adapter?: Adapter | null;
  interceptors?: Array<Interceptor>;
}

// Creates a new URL by combining the specified URLs
function combineURLs(baseURL: string, relativeURL: string) {
  return relativeURL
    ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
    : baseURL;
}

function baseURLInterceptor(baseUrl: string): Interceptor {
  return {
    name: "base-url-interceptor",
    request: (req) => {
      const url = combineURLs(baseUrl, req.url);
      return Effect.succeed(new HttpRequest(url, req.init));
    },
  };
}

export class Builder {
  protected url?: string | null;
  protected adapter?: Adapter | null;
  protected interceptors: Array<Interceptor> = [];

  constructor(options: Options = {}) {
    this.url = options.url;
    this.adapter = options.adapter;
    this.interceptors = options.interceptors ?? [];
  }

  static from(builder: Builder) {
    return new Builder({
      url: builder.url,
      adapter: builder.adapter,
      interceptors: [...builder.interceptors],
    });
  }

  build(): Client {
    if (!this.adapter) {
      throw new Error("Missing adapter");
    }

    const interceptors = pipe(
      O.fromNullable(this.url),
      O.map(baseURLInterceptor),
      O.map((interceptor) => [...this.interceptors, interceptor]),
      O.getOrElse(() => [...this.interceptors])
    );

    return new Client({ interceptors, adapter: this.adapter });
  }

  setBaseUrl(url: string | null) {
    this.url = url;
    return this;
  }

  setAdapter(adapter: Adapter) {
    this.adapter = adapter;
    return this;
  }

  addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor);
    return this;
  }
}
