import { Interceptor, RequestEffectT, provide } from "http-kit";
import { Adapter } from "http-kit/interpreter";

import { runPromise, Effect } from "@effect/io/Effect";
import { Tag } from "@effect/data/Context";

interface Options {
  adapter: Adapter;
  interceptors: Array<Interceptor>;
}

export class Client {
  constructor(private options: Options) {
    this.make = this.make.bind(this);
    this.execute = this.execute.bind(this);
  }

  make<_, E, A>(request: RequestEffectT<E, A>): Effect<never, E, A> {
    return provide(this.options.adapter, ...this.options.interceptors)(request);
  }

  execute<_, E, A>(request: RequestEffectT<E, A>) {
    return runPromise(this.make(request));
  }
}

const Tag_ = Tag<Client>("@http-kit/client");

export { Tag_ as Tag };
