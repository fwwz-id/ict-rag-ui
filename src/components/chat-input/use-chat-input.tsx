"use client";

import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useEffect, useState } from "react";
import { useConversation } from "~/context/conversation-context";

export default function useChatInput() {
  const placeholders = [
    "Gimana cara ngurus passport?",
    "Gimana cara mengajukan Endorsement?",
    "Visa saya ditolak, gimana dong?",
    "Apa saja syarat mengajukan Visa Kunjungan?",
    "Bagaimana cara mengajukan Visa Pelajar?",
    "Bagaimana cara mengurus surat perceraian?",
    "Saya ingin mengajukan pergantian kewarganegaraan, bagaimana caranya?",
  ];

  const [placeholder, setPlaceholder] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);

  const {
    conversations,
    updateLatestConversation,
    pushConversation,
    setLoadingFalse,
    setLoadingTrue,
  } = useConversation();

  const pickRandomPlaceholder = () =>
    setPlaceholder(
      placeholders[Math.floor(Math.random() * placeholders.length)],
    );

  const clearChatInput = () => setChatInput("");

  const submit = async () => {
    if (chatInput === "") return;
    setLoadingTrue();
    clearChatInput();

    const newMessage = { role: "user", content: chatInput } as const;
    const updatedConversations = [...conversations, newMessage];

    pushConversation(newMessage);

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify(updatedConversations),
    });

    if (!response.ok) {
      console.log("Error guys!");
      return;
    }

    if (!response.body) {
      console.log("Error stream text!");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const read = async () => {
      setLoadingFalse();

      const { done, value } = await reader.read();

      if (done) return;

      updateLatestConversation(decoder.decode(value));

      read();
    };

    read();

    // return;
  };

  const onSubmitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submit();
  };

  const onChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;
    setChatInput(() => value);
    setIsDisabled(value.trim() === "");
  };

  const onKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const isEnter = event.key === "Enter";
    const hasShift = event.shiftKey;
    const isComposing =
      // TS note: nativeEvent is a KeyboardEvent
      (event.nativeEvent as KeyboardEvent).isComposing ||
      // Safari fallback
      // biome-ignore lint/suspicious/noExplicitAny: no reason.
      (event.nativeEvent as any).keyCode === 229;

    // If user presses Enter without Shift and not composing text:
    if (isEnter && !hasShift && !isComposing) {
      event.preventDefault(); // stop TextField from inserting a newline
      submit();
      setIsDisabled(true);
    }
    // If Shift+Enter, do nothing — let TextField insert a newline
  };

  const onBlur = () => {
    setTimeout(() => {
      pickRandomPlaceholder();
    }, 500);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: no reason
  useEffect(() => {
    pickRandomPlaceholder();
  }, []);

  return {
    chatInput,
    isDisabled,
    placeholder,
    onBlur,
    onChange,
    onSubmitForm,
    onKeyDown,
  };
}
