import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

import { cn } from "~/lib";

import FaceIcon from "@mui/icons-material/Face";
import Skeleton from "@mui/material/Skeleton";

interface ChatBubbleProps {
  agent?: boolean;
  /** Markdown formatted */
  content: string;
  loading?: boolean;
}

export default function ChatBubble({
  agent,
  content,
  loading,
}: ChatBubbleProps) {
  return (
    <Stack gap={1}>
      <Chip
        icon={<FaceIcon />}
        className={cn("max-w-fit", agent ? "ml-0" : "ml-auto")}
        label={agent ? "Assistant" : "User"}
        color={agent ? "info" : "primary"}
      />
      {loading ? (
        <Skeleton animation="wave" className="w-md h-9" />
      ) : (
        <Paper
          className={cn(
            "py-6 pl-6 rounded-md bg-white/40 backdrop-blur-md",
            agent ? "self-start pr-16" : "self-end pr-6 max-w-2xl",
          )}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </Paper>
      )}
    </Stack>
  );
}
