import * as Effect from "@effect/io/Effect";
import { Interceptor } from "http-kit";

// Logger from https://github.com/honojs/hono/blob/main/src/middleware/logger/index.ts

type PrintFunc = (str: string, ...rest: string[]) => void;

enum LogPrefix {
  Outgoing = "-->",
  Incoming = "<--",
  Error = "xxx",
}

function log(
  fn: PrintFunc,
  prefix: string,
  method: string,
  path: string,
  status: number = 0,
  elapsed?: string
) {
  const out =
    prefix === LogPrefix.Incoming
      ? `${prefix} ${method} ${path} ${colorStatus(status)} ${elapsed}`
      : `${prefix} ${method} ${path}`;
  fn(out);
}

function colorStatus(status: number) {
  const out: { [key: string]: string } = {
    7: `\x1b[35m${status}\x1b[0m`,
    5: `\x1b[31m${status}\x1b[0m`,
    4: `\x1b[33m${status}\x1b[0m`,
    3: `\x1b[36m${status}\x1b[0m`,
    2: `\x1b[32m${status}\x1b[0m`,
    1: `\x1b[32m${status}\x1b[0m`,
    0: `\x1b[33m${status}\x1b[0m`,
  };

  const calculateStatus = (status / 100) | 0;

  return out[calculateStatus];
}

function humanize(times: string[]) {
  const [delimiter, separator] = [",", "."];

  const orderTimes = times.map((v) =>
    v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter)
  );

  return orderTimes.join(separator);
}

function time(start: number) {
  const delta = Date.now() - start;
  return humanize([
    delta < 1000 ? delta + "ms" : Math.round(delta / 1000) + "s",
  ]);
}

type LogMeta = {
  startTime: number;
};

const LoggerId = Symbol("@http-kit/logger");

const logger: Interceptor = {
  name: "logger",
  request(req) {
    const clone = req.clone();

    Reflect.defineProperty(clone, LoggerId, {
      value: { startTime: Date.now() },
    });

    log(console.log, LogPrefix.Outgoing, clone.init.method, clone.url);

    return Effect.succeed(clone);
  },
  response(res, req) {
    const { startTime } = Reflect.get(req, LoggerId) as LogMeta;

    log(
      console.log,
      LogPrefix.Incoming,
      req.init.method,
      req.url,
      res.status,
      time(startTime)
    );

    return Effect.succeed(res);
  },
};

export default logger;
