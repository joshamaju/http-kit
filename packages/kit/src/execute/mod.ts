import * as E from "@effect/io/Effect";
import color from "kleur";
import { Interpreter } from "../interpreter.js";
import { Req, Res } from "../types.js";
import { Interceptor } from "./types.js";

export function execute(request: Request, interceptors?: Array<Interceptor>) {
  return E.gen(function* (s) {
    let mutable_request = request;
    let request_response: Req | Res = request;

    const interpreter = yield* s(Interpreter);

    if (interceptors) {
      for (const interceptor of interceptors) {
        if (!interceptor.request) continue;

        const { name = "(anonymous)" } = interceptor;
        const run = interceptor.request.bind(interceptor);

        yield* s(E.logInfo(color.red(`Running request interceptor: ${name}`)));
        const result = yield* s(run(mutable_request));
        yield* s(E.logInfo(`Request interceptor exited: ${name}`));

        if (interpreter.isRequest(result)) {
          mutable_request = result;
          request_response = result;
        } else {
          request_response = result;
          yield s(E.logInfo(`Returning early from interceptor: ${name}`));
          break;
        }
      }
    }

    yield* s(E.logInfo("Executing request..."));

    let mutable_response = interpreter.isResponse(request_response)
      ? request_response
      : yield* s(interpreter.execute(mutable_request));

    yield* s(E.logInfo("Finished executing request"));

    if (interceptors) {
      for (const interceptor of interceptors) {
        if (!interceptor.response) continue;

        const fn = interceptor.response.bind(interceptor);
        const { name = "(anonymous)" } = interceptor;

        yield* s(E.logInfo(`Running response interceptor: ${name}`));
        mutable_response = yield* s(fn(mutable_response, mutable_request));
        yield* s(E.logInfo(`Finished response interceptor: ${name}`));
      }
    }

    return mutable_response;
  });
}
