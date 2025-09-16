import { useState, useCallback } from "react";
import type { UIMessage } from "ai";

export type Branch = {
  variants: UIMessage[];
  current: number;
};

export function useBranches() {
  const [branches, setBranches] = useState<Record<string, Branch>>({});

  const addBranch = useCallback((messageId: string, message: UIMessage) => {
    setBranches((prev) => {
      const existing = prev[messageId];
      if (!existing) {
        // First time creating a branch for this message
        return {
          ...prev,
          [messageId]: {
            variants: [message], // Store the original message as first variant
            current: 0, // Currently showing the original (index 0)
          },
        };
      } else {
        // Adding another variant to existing branch
        return {
          ...prev,
          [messageId]: {
            variants: [...existing.variants, message],
            current: existing.variants.length, // Point to the newly added variant
          },
        };
      }
    });
  }, []);

  const cycleBranch = useCallback(
    (
      messageId: string,
      direction: "next" | "prev",
      messages: UIMessage[],
      setMessages: (messages: UIMessage[]) => void,
    ) => {
      const currentIndex = messages.findIndex(
        (m) => (m.id as string) === messageId,
      );
      if (currentIndex < 0) return;

      const branch = branches[messageId];
      if (!branch || branch.variants.length === 0) return;

      // All available messages: [original, ...variants]
      // The original message is the first one that was stored when addBranch was first called
      const allMessages = branch.variants;
      const totalCount = allMessages.length;

      if (totalCount === 0) return;

      // Calculate next position based on current position
      let nextPosition: number;
      if (direction === "next") {
        nextPosition = (branch.current + 1) % totalCount;
      } else {
        // "prev"
        nextPosition = (branch.current - 1 + totalCount) % totalCount;
      }

      // Get the message at the next position
      const nextMessage = allMessages[nextPosition];

      // Update the messages array
      const nextMessages = [...messages];
      nextMessages[currentIndex] = nextMessage;
      setMessages(nextMessages);

      // Update branch state with new current position
      setBranches((prev) => ({
        ...prev,
        [messageId]: {
          ...branch,
          current: nextPosition,
        },
      }));
    },
    [branches],
  );

  return {
    branches,
    addBranch,
    cycleBranch,
  };
}
