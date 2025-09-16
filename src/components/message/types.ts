import type { UIMessage } from "ai";

export interface MessagePart {
  type: string;
  text?: string;
  args?: unknown;
  result?: unknown;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

export interface ToolCallPart {
  type: string;
  args?: unknown;
  result?: unknown;
  input?: unknown;
  output?: unknown;
}

export type ExtendedUIMessage = UIMessage & {
  parts?: MessagePart[];
};

export interface Branch {
  variants: UIMessage[];
  current: number;
}
