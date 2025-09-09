import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

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
        "py-6 pl-6 rounded-md",
        agent ? "self-start pr-16" : "self-end pr-6 max-w-2xl",
      )}
    >
      <Stack gap={2}>
        <Chip className="max-w-fit" label={agent ? "Assistant" : "User"} color={agent ? "info" : "primary"} />
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </Stack>
    </Paper>
  );
}
