"use client";

import { memo, useMemo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Streamdown } from "streamdown";
import type { ToolCallPart } from "./types";

interface ToolCallProps {
  part: ToolCallPart;
}

function toJsonMd(value: unknown, label: string) {
  let content = "";
  if (typeof value === "string") content = value;
  else {
    try {
      content = JSON.stringify(value, null, 2);
    } catch {
      content = String(value);
    }
  }
  // Always render as a JSON code block for consistency
  return `**${label}:**\n\n\`\`\`json\n${content}\n\`\`\``;
}

const ToolCallBase = ({ part }: ToolCallProps) => {
  const [expanded, setExpanded] = useState(false);

  const input = part.args ?? part.input;
  const output = part.result ?? part.output;

  // Precompute markdown once per part reference change
  const inputMd = useMemo(
    () => (input !== undefined ? toJsonMd(input, "Input") : null),
    [input],
  );
  const outputMd = useMemo(
    () => (output !== undefined ? toJsonMd(output, "Result") : null),
    [output],
  );

  return (
    <Accordion
      disableGutters
      elevation={0}
      expanded={expanded}
      onChange={(_, isExp) => setExpanded(isExp)}
      className="border border-gray-700 rounded-lg bg-gray-900 text-gray-200 max-w-6xl w-full"
    >
      <AccordionSummary
        className="px-3 py-2 min-h-0 [&_.MuiAccordionSummary-content]:my-0"
        expandIcon={
          <ExpandMoreIcon
            fontSize="small"
            className="transition-transform fill-white duration-200"
          />
        }
      >
        <div className="flex items-center gap-2 min-w-0 w-full">
          <Chip
            label="Tool Call"
            size="small"
            className="px-2 py-1 text-xs bg-primary text-white rounded-md flex-shrink-0"
          />
          <span className="text-sm text-gray-300 truncate">{part.type}</span>
        </div>
      </AccordionSummary>
      <AccordionDetails className="px-3 pb-3 pt-0 space-y-3 border-t border-gray-800">
        {inputMd && (
          <div className="text-xs max-w-6xl break-words [&_*]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words">
            <Streamdown>{inputMd}</Streamdown>
          </div>
        )}
        {outputMd && (
          <div className="text-xs max-w-6xl break-words [&_*]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words">
            <Streamdown>{outputMd}</Streamdown>
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

const ToolCall = memo(ToolCallBase);

ToolCall.displayName = "ToolCall";

export default ToolCall;
