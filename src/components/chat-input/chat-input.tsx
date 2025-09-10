"use client";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

import SendIcon from "@mui/icons-material/Send";

import useChatInput from "./use-chat-input";

export default function ChatInput() {
  const {
    chatInput,
    isDisabled,
    placeholder,
    onBlur,
    onChange,
    onSubmitForm,
    onKeyDown,
  } = useChatInput();

  return (
    <form className="w-full" onSubmit={onSubmitForm}>
      <TextField
        label="Tanyakan sesuatu"
        placeholder={placeholder}
        value={chatInput}
        fullWidth
        multiline
        onChange={onChange}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  className="hover:text-primary"
                  type="submit"
                  disabled={isDisabled}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
            onBlur,
            onKeyDown,
          },
        }}
      />
    </form>
  );
}
