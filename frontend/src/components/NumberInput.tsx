import React from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

type Props = {
  label: string;
  defaultValue: number;
  onChange: (value: number) => void;
};

// Basic input field that will validate the text the user entered. The onChange function
// is only called if the input is a number.
function NumberInput({ label, defaultValue, onChange }: Props) {
  const [error, setError] = React.useState<boolean>(false);

  return (
    <TextField
      label={label}
      sx={{ flexGrow: 1, flexBasis: 1 }}
      defaultValue={defaultValue}
      error={error}
      size="small"
      variant="standard"
      onBlur={(event) => {
        const value = Number(event.target.value);

        if (!isNaN(value)) {
          onChange(value);
        }

        setError(isNaN(value));
      }}
      onKeyDown={(event) => {
        switch (event.key) {
          case "Escape":
          case "Enter":
            (event.target as any).blur();
            break;
        }
      }}
      InputProps={{
        startAdornment: (
          <>
            <InputAdornment position="start">{">"}</InputAdornment>
          </>
        ),
      }}
    />
  );
}

export default NumberInput;
