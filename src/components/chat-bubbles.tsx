"use client";

import Stack from "@mui/material/Stack";

import ChatBubble from "./chat-bubble";

import { useConversation } from "~/context/conversation-context";

export default function ChatBubbles() {
  const { conversations, isLoading } = useConversation();

  return (
    <Stack className="space-y-2">
      {conversations.map((chat, id) => (
        // Render client then agent for each conversation pair
        <ChatBubble
          key={id}
          agent={chat.role === "assistant"}
          content={chat.content}
        />
      ))}
      {
        isLoading && <ChatBubble agent content="...." loading />
      }
    </Stack>
  );
}
