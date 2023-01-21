import { createTheme } from "@mui/material/styles";

// Theme with purple background and pink/yellow foreground.
export default createTheme({
  typography: {
    fontFamily: "monospace",
  },
  palette: {
    background: {
      default: "#2e636b",
      paper: "#317d69",
    },
    primary: {
      main: "#f59464",
      dark: "#1bcfa5",
    },
    text: {
      primary: "#f5dd64",
      secondary: "#c9ff9c",
      disabled: "#449e97",
    },
  },
});
