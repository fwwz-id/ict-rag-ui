import { Paper } from "@mui/material";
import type { MessagePart } from "./types";
import { memo } from "react";

interface ToolResultProps {
  part: MessagePart;
}

const ToolResult = memo(({ part }: ToolResultProps) => {
  return (
    <Paper className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-w-6xl w-full break-words">
      <span className="text-xs text-gray-600 font-medium">Tool Result:</span>
      <pre className="text-xs text-gray-700 mt-2 bg-white p-2 rounded border whitespace-pre-wrap break-words overflow-x-auto">
        {typeof part.result === "string"
          ? part.result
          : JSON.stringify(part.result, null, 2)}
      </pre>
    </Paper>
  );
});

export default ToolResult;
