"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  palette: {
    mode: "light",
    primary: {
      main: "#e92c76",
      light: "#f289af",
      dark: "#d5005b",
    },
    secondary: {
      main: "#e92cd6",
      light: "#f7b3ed",
      dark: "#d200be",
    },
    background: {
      default: "#f1f1f1",
      paper: "#ffffff",
    },
    text: {
      primary: "#373737",
      secondary: "#878787",
      disabled: "#7d7d81",
    },
    error: {
      main: "#df1d7e",
    },
    warning: {
      main: "#df7e1d",
    },
    success: {
      main: "#1ddf1d",
    },
  },
});

export default theme;
