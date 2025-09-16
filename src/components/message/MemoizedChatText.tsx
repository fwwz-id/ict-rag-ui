"use client";

import { memo } from "react";
import { Streamdown } from "streamdown";

const MemoizedChatText = memo(
  ({ content }: { content: string }) => {
    return (
      <div className="max-w-6xl w-full break-words [&_*]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:break-words">
        <Streamdown>{content}</Streamdown>
      </div>
    );
  },
  (prev, next) => prev.content === next.content,
);

MemoizedChatText.displayName = "MemoizedChatText";

export default MemoizedChatText;
