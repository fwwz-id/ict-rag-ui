"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toggler } from "~/lib";

const RootContext = createContext(
  {} as {
    isFormDialogOpen: boolean;
    toggleFormDialog: () => void;
  },
);

export const useRootContext = () => useContext(RootContext);

export function RootContextProvider({ children }: { children: ReactNode }) {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const toggleFormDialog = toggler(setIsFormDialogOpen);

  return (
    <RootContext value={{ isFormDialogOpen, toggleFormDialog }}>
      {children}
    </RootContext>
  );
}
