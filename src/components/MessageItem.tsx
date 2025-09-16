"use client";

import type { UIMessage } from "ai";

import type { Branch } from "./message/types";

import { forwardRef } from "react";
import { Chip } from "@mui/material";
import RoleAvatar from "./message/RoleAvatar";
import MemoizedChatText from "./message/MemoizedChatText";
import ToolCall from "./message/ToolCall";
import ToolResult from "./message/ToolResult";

interface MessageItemProps {
  message: UIMessage;
  branch?: Branch;
  onBranchPrev?: () => void;
  onBranchNext?: () => void;
}

const MessageItem = forwardRef<HTMLDivElement, MessageItemProps>(
  function MessageItem(
    {
      message,
      branch,
      // onBranchPrev,
      // onBranchNext,
    }: MessageItemProps,
    ref,
  ) {
    const isUser = message.role === "user";
    return (
      <div ref={ref} className="flex gap-3 items-start">
        <RoleAvatar role={message.role} />
        <div className="flex-1 space-y-2 max-w-6xl w-full break-words">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {isUser ? "You" : "Assistant"}
            </span>
            {!isUser && branch?.variants && branch.variants.length > 0 ? (
              <div className="relative">
                <Chip
                  label="Branches"
                  size="small"
                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md border border-primary/20"
                />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                  {branch.variants.length + 1}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            {message.parts.map((part, idx) => {
              if (part.type === "text") {
                return (
                  <MemoizedChatText
                    key={`${message.id}-text-${idx}`}
                    content={part.text || ""}
                  />
                );
              }

              if (
                part.type === "tool-call" ||
                part.type?.startsWith?.("tool-")
              ) {
                return (
                  <ToolCall key={`${message.id}-toolcall-${idx}`} part={part} />
                );
              }

              if (part.type === "tool-result") {
                return (
                  <ToolResult
                    key={`${message.id}-toolresult-${idx}`}
                    part={part}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      </div>
    );
  },
);

export default MessageItem;
