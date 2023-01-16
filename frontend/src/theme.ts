import { createTheme } from "@mui/material/styles";

// Theme with purple background and pink/yellow foreground.
export default createTheme({
  typography: {
    fontFamily: "monospace",
  },
  palette: {
    background: {
      default: "#582e6b",
      paper: "#3f204d",
    },
    primary: {
      main: "#f59464",
      dark: "#1bcfcf",
    },
    text: {
      primary: "#f5dd64",
      secondary: "#f09cff",
      disabled: "#9b6fb0",
    },
  },
});
