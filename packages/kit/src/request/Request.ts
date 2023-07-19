import { Body as RequestBody } from "../body/types.js";

export type RequestInit_ = Omit<RequestInit, "body" | "signal"> & {
  search?: string;
  body?: BodyInit | RequestBody;
};

export class Request {
  readonly _tag = "HttpRequest";

  readonly url: string;
  readonly init: RequestInit_ & { method: string };

  constructor(input: string | URL, init?: RequestInit_) {
    this.url = typeof input === "string" ? input : input.toString();
    this.init = { ...init, method: init?.method ?? "GET" };
  }

  clone(): Request {
    return new Request(this.url, this.init ? { ...this.init } : undefined);
  }
}
