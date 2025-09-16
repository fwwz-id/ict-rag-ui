"use client";

import { memo, useMemo } from "react";
import { Paper } from "@mui/material";
import { Streamdown } from "streamdown";

interface ErrorPartProps {
  errorText: string;
}

function toErrorMarkdown(text: string) {
  // Present the error clearly with a heading and a fenced block.
  // Keep language as text to avoid misleading highlighting.
  const safe = text || "Unknown error.";
  return `### Error\n\n\`\`\`text\n${safe}\n\`\`\``;
}

const ErrorPartBase = ({ errorText }: ErrorPartProps) => {
  const md = useMemo(() => toErrorMarkdown(errorText), [errorText]);
  return (
    <Paper className="border border-rose-300 bg-rose-50 text-rose-900 rounded-lg p-3 max-w-6xl w-full break-words">
      <div className="prose prose-sm max-w-none [&_*]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words">
        <Streamdown>{md}</Streamdown>
      </div>
    </Paper>
  );
};

const ErrorPart = memo(
  ErrorPartBase,
  (prev, next) => prev.errorText === next.errorText,
);

ErrorPart.displayName = "ErrorPart";

export default ErrorPart;
