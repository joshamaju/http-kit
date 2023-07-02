import * as Effect from "@effect/io/Effect";
import { Interpreter } from "../interpreter.js";
import { Req, Res } from "../types.js";
import { Interceptor } from "./types.js";
import color from "kleur";

export function execute(request: Request, interceptors?: Array<Interceptor>) {
  return Effect.gen(function* (s) {
    let mutated_request = request;
    let request_or_response: Req | Res = request;

    const interpreter = yield* s(Interpreter);

    if (interceptors) {
      for (const interceptor of interceptors) {
        if (!interceptor.request) continue;

        const { name = "(anonymous)" } = interceptor;

        yield s(
          Effect.logInfo(color.red(`Running request interceptor: ${name}`))
        );

        const result = yield* s(
          interceptor.request.bind(interceptor)(mutated_request)
        );

        yield s(Effect.logInfo(`Request interceptor exited: ${name}`));

        if (interpreter.isRequest(result)) {
          mutated_request = result;
          request_or_response = result;
        } else {
          request_or_response = result;
          yield s(
            Effect.logInfo(`Returning early from request interceptor: ${name}`)
          );
          break;
        }
      }
    }

    yield s(Effect.logInfo("Executing request"));

    let mutated_res = interpreter.isResponse(request_or_response)
      ? request_or_response
      : yield* s(interpreter.execute(mutated_request));

    yield s(Effect.logInfo("Finished executing request"));

    if (interceptors) {
      for (const interceptor of interceptors) {
        if (!interceptor.response) continue;

        const { name = "(anonymous)" } = interceptor;

        yield s(Effect.logInfo(`Running response interceptor: ${name}`));

        mutated_res = yield* s(
          interceptor.response.bind(interceptor)(mutated_res, mutated_request)
        );

        yield s(Effect.logInfo(`Finished response interceptor: ${name}`));
      }
    }

    return mutated_res;
  });
}
