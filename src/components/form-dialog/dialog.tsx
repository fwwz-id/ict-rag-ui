"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import type { AIConfig } from "./action";

import { useFormDialogContext } from "~/context/form-dialog-context";
import { useFormDialog } from "./use-form-dialog";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function FormDialog({ config }: { config: AIConfig }) {
  const { isFormDialogOpen, toggleFormDialog } = useFormDialogContext();
  const {
    options,
    selectedModel,
    apiKeyValue,
    baseURLValue,
    onChange,
    onSubmit,
    isAPIKeyShown,
    toggleAPIKeyShown,
  } = useFormDialog({ config });

  return (
    <Dialog fullWidth open={isFormDialogOpen} onClose={toggleFormDialog}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To use this chatbot, please configure the AI service settings below.{" "}
          <br />
          <Typography component="span" variant="body2" color="info">
            We only support OpenAI REST API specification at the moment.
          </Typography>
        </DialogContentText>
        <form id="ai-configuration">
          <TextField
            autoFocus
            required
            margin="dense"
            id="baseurl"
            name="baseurl"
            label="Base URL"
            type="text"
            fullWidth
            placeholder="https://api.openai.com, http://127.0.0.1:11434/v1 or https://ai.sumopod.com/v1"
            variant="standard"
            value={baseURLValue}
            onChange={(evt) => onChange("baseURL", evt.target.value)}
          />

          <TextField
            autoFocus
            required
            margin="dense"
            id="api-key"
            name="api-key"
            label="API Key"
            type={isAPIKeyShown ? "text" : "password"}
            fullWidth
            placeholder="sk-xxxx..."
            variant="standard"
            value={apiKeyValue}
            onChange={(evt) => onChange("apiKey", evt.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleAPIKeyShown}>
                      {isAPIKeyShown ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Autocomplete
            disablePortal
            autoFocus
            id="model"
            options={options}
            groupBy={(option) => option.provider}
            getOptionLabel={(option) => option.model}
            value={selectedModel}
            // biome-ignore lint/style/noNonNullAssertion: always string, this will checked by zod.
            onChange={(_, value) => onChange("model", value?.model!)}
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
        <Button className="text-disabled" onClick={toggleFormDialog}>
          Cancel
        </Button>
        <Button form="subscription-form" onClick={onSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
