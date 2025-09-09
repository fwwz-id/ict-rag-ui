import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Paper from "@mui/material/Paper";
import { cn } from "~/lib";

interface ChatBubbleProps {
  agent?: boolean;
  /** Markdown formatted */
  content: string;
}

export default function ChatBubble({ agent, content }: ChatBubbleProps) {
  return (
    <Paper
      className={cn(
        "py-6 pl-6",
        agent ? "self-start pr-16" : "self-end pr-6 max-w-2xl",
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
    </Paper>
  );
}
