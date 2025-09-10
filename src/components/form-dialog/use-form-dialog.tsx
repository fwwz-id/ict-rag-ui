"use client";

import { useState, useMemo } from "react";

import { useFormDialogContext } from "~/context/form-dialog-context";
import { setAIConfig, type AIConfig } from "./action";
import { toggler } from "~/lib";

const COMMON_MODELS = [
  "gpt-5",
  "gpt-5-chat",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "gemini/gemini-2.0-flash",
  "gemini/gemini-2.5-flash",
].map((model) => ({ model, provider: "common" }));

const OLLAMA_MODELS = ["gpt-oss:20b"].map((model) => ({
  model,
  provider: "ollama",
}));

const GEMINI_API_MODELS = [
  "models/gemini-2.5-pro",
  "models/gemini-2.5-flash",
  "models/gemini-2.0-flash",
].map((model) => ({ model, provider: "gemini" }));

export function useFormDialog({ config }: { config: AIConfig }) {
  const { toggleFormDialog, setSnackbarOpenState } = useFormDialogContext();
  const [_config, setConfig] = useState<AIConfig>({ ...config });
  const [isAPIKeyShown, setIsAPIKeyShown] = useState(false);

  const options = [...OLLAMA_MODELS, ...COMMON_MODELS, ...GEMINI_API_MODELS];

  const onChange = (field: keyof AIConfig, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async () => {
    const result = await setAIConfig(_config);

    if (!result.success) {
      return setSnackbarOpenState({
        severity: "error",
        message: "Failed to save configuration",
      });
    }

    toggleFormDialog();

    return setSnackbarOpenState({
      severity: "success",
      message: "Successfully save configuration",
    });
  };

  const toggleAPIKeyShown = toggler(setIsAPIKeyShown);

  // biome-ignore lint/correctness/useExhaustiveDependencies: skip options due to infinite re-render
  const selectedModel = useMemo(
    () =>
      options.find((option) => option.model === _config.model) || {
        provider: "ollama",
        model: "gpt-oss:20b",
      },
    [_config],
  );

  return {
    options,
    selectedModel,
    apiKeyValue: _config.apiKey,
    baseURLValue: _config.baseURL,
    onChange,
    onSubmit,
    isAPIKeyShown,
    toggleAPIKeyShown,
  };
}
