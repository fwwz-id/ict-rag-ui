"use client";

import { useEffect, useMemo, useState } from "react";
import type { UIMessage } from "ai";
import { useDebounce } from "@uidotdev/usehooks";
import { useLocalStorage } from "./useLocalStorage";

// Persist chat messages using useLocalStorage, and debounce writes
// so we don't hammer localStorage while streaming.
export function useChatPersistence(chatId?: string) {
  const key = chatId ? `chat:${chatId}` : "__chat:disabled__";
  const [mounted, setMounted] = useState(false);

  // Backing store. When chatId is not present, use a disabled key and guard writes.
  const [storedMessages, setStoredMessages] = useLocalStorage<UIMessage[]>(
    key,
    [],
  );

  // Queue messages to save; debounce actual persistence.
  const [pending, setPending] = useState<UIMessage[] | null>(null);
  const debouncedPending = useDebounce(pending, 100 * 10);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Write debounced messages to localStorage when ready
  useEffect(() => {
    if (!chatId) return; // do not write without a chat id
    if (!debouncedPending) return;
    try {
      setStoredMessages(debouncedPending);
    } catch (error) {
      console.warn("Failed to save chat to localStorage:", error);
    }
  }, [debouncedPending, chatId, setStoredMessages]);

  // Public save method: queue the latest messages for debounced persistence
  const saveMessages = (messages: UIMessage[]) => {
    if (!chatId) return;
    setPending(messages);
  };

  // Expose messages read from storage after mount
  const initialMessages = useMemo<UIMessage[]>(() => {
    if (!mounted || !chatId) return [];
    return Array.isArray(storedMessages) ? storedMessages : [];
  }, [mounted, chatId, storedMessages]);

  return {
    initialMessages,
    isLoaded: mounted,
    saveMessages,
  };
}
