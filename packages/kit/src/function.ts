import * as Effect from "@effect/io/Effect";

export function searchParams(input: Record<string, any>) {
  return new URLSearchParams(input).toString();
}

export function url(url: string | URL, base?: string | URL) {
  return Effect.tryCatch(
    () => new URL(url, base),
    () => new Error("Invalid URL")
  );
}
