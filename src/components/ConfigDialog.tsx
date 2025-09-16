"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { z } from "zod";
import { saveCookies } from "~/cookie/actions";
import DialogContentText from "@mui/material/DialogContentText";
import { useChatToolbar } from "./ChatContext";

const schema = z.object({
  baseURL: z.string().url("Please enter a valid URL"),
  apiKey: z.string().min(1, "API Key is required"),
  model: z.string().min(1, "Model is required"),
});

type FormData = z.infer<typeof schema>;

type Props = {
  defaults: { baseURL: string; apiKey: string; model: string };
};

function ConfigDialog({ defaults }: Props) {
  const { isConfigOpen, onShowConfig, onCloseConfig } = useChatToolbar();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  console.log("ConfigDialog Rerender!.");

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      baseURL: defaults.baseURL ?? "",
      apiKey: defaults.apiKey ?? "",
      model: defaults.model ?? "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!defaults.apiKey || !defaults.baseURL || !defaults.model) {
      onShowConfig();
    }
  }, [defaults, onShowConfig]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: no reason
  const onSubmit = useCallback(async (data: FormData) => {
    setSaving(true);
    setError(null);

    try {
      await saveCookies(data);
      // onSaved?.();
      onCloseConfig();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save configuration",
      );
    } finally {
      setSaving(false);
    }
  }, []);

  const handleToggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Dialog open={isConfigOpen} onClose={onCloseConfig} maxWidth="sm" fullWidth>
      <DialogTitle>API Configuration</DialogTitle>
      <DialogContent>
        <DialogContentText className="mb-6 text-pink-500">
          Configure your OpenAI-compatible API settings. We currently support
          any service that follows the OpenAI API specification.
        </DialogContentText>
        <Stack
          gap={2}
          className="pt-2"
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Controller
            name="baseURL"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Base URL"
                placeholder="https://api.openrouter.ai/v1"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="apiKey"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="API Key"
                type={showApiKey ? "text" : "password"}
                placeholder="sk-..."
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleApiKeyVisibility}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showApiKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
          <Controller
            name="model"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Model"
                placeholder="gpt-5-nano"
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  'Please use model that supports tools, e.g. "gpt-5-nano"'
                }
              />
            )}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseConfig}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disableElevation
          disabled={!isValid || saving}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const MemoizedConfigDialog = memo(ConfigDialog);

export default MemoizedConfigDialog;
