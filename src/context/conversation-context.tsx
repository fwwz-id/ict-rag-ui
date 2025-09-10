"use client";

import type { ChatSchema, ConversationSchema } from "~/app/api/chat/validation";

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ConversationContext = createContext(
  {} as {
    conversations: ConversationSchema;
    wipeConversations: () => void;
    pushConversation: (conversation: ChatSchema) => void;
    updateLatestConversation: (chunk: string) => void;
    isLoading: boolean;
    setLoadingFalse: () => void;
    setLoadingTrue: () => void;
  },
);

export const useConversation = () => useContext(ConversationContext);

export function ConversationContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationSchema>([]);

  const wipeConversations = () => {
    setConversations([]);
    localStorage.removeItem("conversations");
  };

  const pushConversation = (conversation: ChatSchema) => {
    setConversations((prev) => {
      const next = [...prev, conversation];
      localStorage.setItem("conversations", JSON.stringify(next));
      return next;
    });
  };

  const updateLatestConversation = (chunk: string) => {
    setConversations((prev) => {
      const lastIndex = prev.length - 1;
      const lastConversation = prev[lastIndex];
      console.log(lastIndex, lastConversation);

      if (lastIndex >= 0 && lastConversation?.role === "assistant") {
        const updated = [...prev];
        updated[lastIndex] = {
          ...lastConversation,
          content: (lastConversation.content || "") + chunk,
        };
        localStorage.setItem("conversations", JSON.stringify(updated));
        return updated;
      } else {
        // Create new assistant conversation if last one isn't assistant or no conversations exist
        const newConversation: ChatSchema = {
          role: "assistant",
          content: chunk,
        };
        const updated = [...prev, newConversation];
        localStorage.setItem("conversations", JSON.stringify(updated));
        return updated;
      }
    });
  };

  const setLoadingFalse = () => setIsLoading(false);
  const setLoadingTrue = () => setIsLoading(true);

  useEffect(() => {
    const localConversation = localStorage.getItem("conversations");

    if (!localConversation) return;

    setConversations(JSON.parse(localConversation));
  }, []);

  return (
    <ConversationContext
      value={{
        conversations,
        isLoading,
        updateLatestConversation,
        wipeConversations,
        pushConversation,
        setLoadingFalse,
        setLoadingTrue,
      }}
    >
      {children}
    </ConversationContext>
  );
}
