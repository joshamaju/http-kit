import { pipe } from "@effect/data/Function";
import * as E from "@effect/io/Effect";
import * as L from "@effect/io/Layer";

import { Adapter } from "../interpreter.js";
import { Req, Res } from "../types.js";
import { Interceptor } from "./types.js";

export function execute(request: Req, interceptors?: Array<Interceptor>) {
  return E.gen(function* (s) {
    let mutable_request = request;
    let request_response: Req | Res = request;

    const interpreter = yield* s(Adapter);

    if (interceptors) {
      for (const interceptor of interceptors) {
        if (!interceptor.request) continue;

        const { name = "(anonymous)" } = interceptor;
        const run = interceptor.request.bind(interceptor);

        const result = yield* s(
          E.logDebug("Executing interceptor"),
          E.flatMap(() => run(mutable_request)),
          E.tap(() => E.logDebug("Exiting interceptor")),
          E.annotateLogs("interceptor", name),
          E.annotateLogs("type", "Request"),
          E.withLogSpan("ms")
        );

        if (interpreter.isResponse(result)) {
          request_response = result;
          break;
        } else {
          mutable_request = result;
          request_response = result;
        }
      }
    }

    let mutable_response = interpreter.isResponse(request_response)
      ? request_response
      : yield* s(
          E.logDebug("Executing request"),
          E.flatMap(() => interpreter.execute(mutable_request)),
          E.tap(() => E.logDebug("Request done")),
          E.withLogSpan("ms")
        );

    if (interceptors) {
      for (const interceptor of interceptors) {
        if (!interceptor.response) continue;

        const { name = "(anonymous)" } = interceptor;
        const run = interceptor.response.bind(interceptor);

        mutable_response = yield* s(
          E.logDebug("Executing interceptor"),
          E.flatMap(() => run(mutable_response, mutable_request)),
          E.tap(() => E.logDebug("Exiting interceptor")),
          E.annotateLogs("interceptor", name),
          E.annotateLogs("type", "Response"),
          E.withLogSpan("ms")
        );
      }
    }

    return mutable_response;
  });
}

export function makeLayer(
  adapter: Adapter,
  ...interceptors: Array<Interceptor>
) {
  return L.succeed(Adapter, {
    ...adapter,
    execute(request) {
      return pipe(
        execute(request, interceptors),
        E.provideService(Adapter, adapter)
      );
    },
  });
}

export function provide(adapter: Adapter, ...interceptors: Array<Interceptor>) {
  return E.provideSomeLayer(makeLayer(adapter, ...interceptors));
}
