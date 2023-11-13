import * as Effect from "effect/Effect";

export function searchParams(input: Record<string, any>) {
  return new URLSearchParams(input).toString();
}

export function url(url: string | URL, base?: string | URL) {
  return Effect.try({
    try: () => new URL(url, base),
    catch: () => new Error("Invalid URL"),
  });
}
