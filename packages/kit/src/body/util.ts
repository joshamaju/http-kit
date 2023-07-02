import { Body } from "./types.js";

export function isBody(input: unknown): input is Body {
  return (
    typeof input === "object" &&
    input !== null &&
    "_tag" in input &&
    (input._tag === "Text" || input._tag === "Form")
  );
}
