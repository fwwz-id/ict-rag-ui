"use client";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type SyntheticEvent,
  createContext,
  useContext,
  useState,
} from "react";

import Alert, { type AlertColor } from "@mui/material/Alert";
import Snackbar, { type SnackbarCloseReason } from "@mui/material/Snackbar";

import { toggler } from "~/lib";

const FormDialogContext = createContext(
  {} as {
    isFormDialogOpen: boolean;
    toggleFormDialog: () => void;
    snackbarOpen: boolean;
    setSnackbarOpenState: ({
      severity,
      message,
    }: Partial<{
      severity: AlertColor;
      message: string;
    }>) => void;
    snackbarSeverity: AlertColor;
    setSnackbarSeverity: Dispatch<SetStateAction<AlertColor>>;
  },
);

export const useFormDialogContext = () => useContext(FormDialogContext);

export function FormDialogContextProvider({ children }: { children: ReactNode }) {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [snackbarMessage, setSnackbarMessage] = useState("Successfully ...");

  const toggleFormDialog = toggler(setIsFormDialogOpen);

  const setSnackbarOpenState = ({
    severity,
    message,
  }: Partial<{
    severity: AlertColor;
    message: string;
  }>) => {
    if (severity) setSnackbarSeverity(severity);
    if (message) setSnackbarMessage(message);

    setSnackbarOpen(true);
  };

  const setSnackbarCloseState = (
    _?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") return;

    setSnackbarOpen(false);
  };

  return (
    <FormDialogContext
      value={{
        isFormDialogOpen,
        toggleFormDialog,
        snackbarOpen,
        setSnackbarOpenState,
        snackbarSeverity,
        setSnackbarSeverity,
      }}
    >
      {children}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        onClose={setSnackbarCloseState}
        autoHideDuration={5000}
      >
        <Alert severity={snackbarSeverity} onClose={setSnackbarCloseState}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </FormDialogContext>
  );
}
