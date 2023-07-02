import { Body } from "./types.js";

export function text(input: string): Body {
  return {
    _tag: "Text",
    value: input,
    headers: {
      "Content-Type": "text/plain",
      "Content-Length": input.length.toString(),
    },
  };
}

export function json(input: object): Body {
  const body = JSON.stringify(input);
  return {
    _tag: "Text",
    value: body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Content-Length": body.length.toString(),
    },
  };
}

export function form(
  input: FormData | Record<string, string | Array<unknown>>
): Body {
  const formData = new FormData();

  if (!(input instanceof FormData)) {
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        const item = input[key];

        if (Array.isArray(item)) {
          for (let n of item) formData.append(key, n as any);
        } else {
          formData.set(key, item);
        }
      }
    }
  }

  return {
    _tag: "Form",
    value: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
}
