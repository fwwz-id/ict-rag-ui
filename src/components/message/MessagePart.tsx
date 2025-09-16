import type { ToolUIPart } from "ai";
import type { MessagePart as MessagePartType } from "./types";

import ToolCall from "./ToolCall";
import ToolResult from "./ToolResult";
import ErrorPart from "./ErrorPart";

interface MessagePartProps {
  part: MessagePartType;
  index: number;
}

type getInformationToolUIPart = ToolUIPart<{
  getInformation: {
    input: {
      prompt: string;
    };
    output: {
      searchQuery: string;
      searchStrategy: string;
      attemptNumber: number;
      totalResults: number;
      relevantResults: number;
      results: Array<{
        id: number;
        version: number;
        score: number;
        payload: {
          pair: string;
          turns: number;
          chat_id: number;
        };
      }>;
    };
  };
}>;

export default function MessagePart({ part, index }: MessagePartProps) {
  if (part.type === "tool-call" || part.type?.startsWith?.("tool-")) {
    return <ToolCall key={index} part={part} />;
  }

  if (part.type === "tool-result") {
    return <ToolResult key={index} part={part} />;
  }

  if (part.type === "error") {
    return (
      <ErrorPart
        errorText={(part as getInformationToolUIPart).errorText || ""}
      />
    );
  }

  return null;
}
