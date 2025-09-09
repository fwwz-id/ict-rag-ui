"use client";

import type { FormEvent } from "react";

import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

import { useRootContext } from "~/context/root-context";
import Typography from "@mui/material/Typography";

export default function FormDialog() {
  const { isFormDialogOpen: open, toggleFormDialog: handleClose } =
    useRootContext();

  // biome-ignore lint/correctness/noUnusedFunctionParameters: temporary disable
  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {};

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To use this chatbot, please configure the AI service settings below.{" "}
          <br />
          <Typography component="span" variant="body2" color="info">
            We only support OpenAI REST API specification at the moment.
          </Typography>
        </DialogContentText>
        <form onSubmit={handleSubmit} id="ai-configuration">
          <TextField
            autoFocus
            required
            margin="dense"
            id="baseurl"
            name="baseurl"
            label="Base URL"
            type="text"
            fullWidth
            placeholder="https://api.openai.com or http://127.0.0.1:11434/v1"
            variant="standard"
          />

          <TextField
            autoFocus
            required
            margin="dense"
            id="api-key"
            name="api-key"
            label="API Key"
            type="text"
            fullWidth
            placeholder="sk-xxxx..."
            variant="standard"
          />

          <Autocomplete
            disablePortal
            autoFocus
            id="model"
            options={[
              "gpt-5",
              "gpt-5-chat",
              "gpt-5-mini",
              "gpt-5-nano",
              "gpt-4.1",
              "gpt-4.1-mini",
              "gpt-4.1-nano",
              "gemini/gemini-2.0-flash",
              "gemini/gemini-2.5-flash",
            ]}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                variant="standard"
                label="Model"
                required
                fullWidth
                margin="dense"
              />
            )}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button className="text-disabled" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" form="subscription-form">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
