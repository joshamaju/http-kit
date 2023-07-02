interface Data {
  readonly _tag: string;
  readonly headers?: Record<string, string>;
}

export interface Text extends Data {
  readonly _tag: "Text";
  readonly value: string;
}

export interface Form extends Data {
  readonly _tag: "Form";
  readonly value: FormData;
}

export interface Json extends Text {}

export type Body = Text | Json | Form;
